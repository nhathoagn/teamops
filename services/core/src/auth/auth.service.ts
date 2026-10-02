import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { MemberRole } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtPayload } from './types/jwt-payload.type'

const BCRYPT_ROUNDS = 12

type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthOrganization = {
  id: string
  name: string
  slug: string
  role: MemberRole
}

export type AuthResponse = {
  user: AuthUser
  organizations: AuthOrganization[]
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException('Email already exists')
    }

    const passwordHash = await hash(dto.password, BCRYPT_ROUNDS)
    const organizationName = dto.organizationName?.trim() || `${dto.name.trim()}'s Organization`
    const slug = await this.uniqueSlug(organizationName)

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: dto.name.trim(),
          passwordHash,
        },
      })
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug,
        },
      })
      const member = await tx.member.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          role: MemberRole.OWNER,
        },
      })

      return { user, organization, member }
    })

    const tokens = await this.issueTokens(created.user.id, created.user.email)
    await this.prisma.user.update({
      where: { id: created.user.id },
      data: { refreshTokenHash: await hash(tokens.refreshToken, BCRYPT_ROUNDS) },
    })

    return {
      user: this.toUser(created.user),
      organizations: [
        {
          id: created.organization.id,
          name: created.organization.name,
          slug: created.organization.slug,
          role: created.member.role,
        },
      ],
      ...tokens,
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase()
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { members: { include: { org: true } } },
    })
    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const tokens = await this.issueTokens(user.id, user.email)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      user: this.toUser(user),
      organizations: user.members.map((member) => ({
        id: member.org.id,
        name: member.org.name,
        slug: member.org.slug,
        role: member.role,
      })),
      ...tokens,
    }
  }

  async refresh(refreshToken: string): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const payload = await this.verifyRefreshToken(refreshToken)
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user?.refreshTokenHash || !(await compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const tokens = await this.issueTokens(user.id, user.email)
    await this.storeRefreshToken(user.id, tokens.refreshToken)
    return tokens
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    })
  }

  async me(userId: string): Promise<AuthUser & { organizations: AuthOrganization[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { members: { include: { org: true } } },
    })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return {
      ...this.toUser(user),
      organizations: user.members.map((member) => ({
        id: member.org.id,
        name: member.org.name,
        slug: member.org.slug,
        role: member.role,
      })),
    }
  }

  private async issueTokens(userId: string, email: string) {
    const accessPayload: JwtPayload = { sub: userId, email, type: 'access' }
    const refreshPayload: JwtPayload = { sub: userId, email, type: 'refresh' }

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(accessPayload, this.accessExpiresIn()),
      this.signToken(refreshPayload, this.refreshExpiresIn()),
    ])

    return { accessToken, refreshToken }
  }

  private signToken(payload: JwtPayload, expiresIn: string): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.jwtSecret(),
      expiresIn: expiresIn as never,
    })
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.jwtSecret(),
      })
      if (payload.type !== 'refresh' || !payload.sub) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      return payload
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private storeRefreshToken(userId: string, refreshToken: string) {
    return hash(refreshToken, BCRYPT_ROUNDS).then((refreshTokenHash) =>
      this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash },
      }),
    )
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'organization'

    let slug = base
    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${base}-${randomBytes(3).toString('hex')}`
    }
    return slug
  }

  private toUser(user: { id: string; name: string; email: string }): AuthUser {
    return { id: user.id, name: user.name, email: user.email }
  }

  private jwtSecret(): string {
    const secret = this.config.get<string>('JWT_SECRET')
    if (!secret) {
      throw new Error('JWT_SECRET is not set')
    }
    return secret
  }

  private accessExpiresIn(): string {
    return this.config.get<string>('JWT_EXPIRES_IN') ?? '15m'
  }

  private refreshExpiresIn(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'
  }
}
