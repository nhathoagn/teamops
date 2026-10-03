 import {
   ForbiddenException,
   Injectable,
   NotFoundException,
 } from '@nestjs/common'
 import { MemberRole } from '@prisma/client'
 import { randomBytes } from 'crypto'
 import { PrismaService } from '../prisma/prisma.service'
 import { CreateOrganizationDto } from './dto/create-organization.dto'
 import { UpdateOrganizationDto } from './dto/update-organization.dto'
 
@Injectable()
export class OrganizationsService {
    constructor(private readonly prisma: PrismaService) {}

    async create(userId: string, dto: CreateOrganizationDto) {
        const name = dto.name.trim()
        const slug = await this.uniqueSlug(name)

        return this.prisma.$transaction(async (tx) => {
            const organization = await tx.organization.create({
                data: {name, slug}
            })
            const member = await tx.member.create({
                data: {
                    userId,
                    orgId: organization.id,
                    role: MemberRole.OWNER
                }
            })
            return { 
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
                logoUrl: organization.logoUrl,
                role: member.role
             }
        })

    }

    async findAll(userId: string) {
        const memberships = await this.prisma.member.findMany({
            where: { userId },
            include: { org: true },
            orderBy: { createdAt: 'asc' }
        })
        
        return memberships.map((membership) => ({
            id: membership.org.id,
            name: membership.org.name,
            slug: membership.org.slug,
            logoUrl: membership.org.logoUrl,
            role: membership.role
        }))
    }

    async findOne(userId: string, orgId: string){
        const membership = await this.findMembership(userId, orgId)

        return {
            id: membership.org.id,
            name: membership.org.name,
            slug: membership.org.slug,
            logoUrl: membership.org.logoUrl,
            role: membership.role
        }
    }

    async update(userId: string, orgId: string, dto: UpdateOrganizationDto) {
        const membership = await this.findMembership(userId, orgId)
        if( membership.role === MemberRole.STAFF){
            throw new ForbiddenException('Only owners and admins can update this organization')
        }
        const organization = await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
                ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl.trim() } : {})
            }
        })
        return {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            logoUrl: organization.logoUrl,
            role: membership.role
        }
    }

    private async findMembership(userId: string, orgId: string) {
        const membership = await this.prisma.member.findUnique({
            where: {userId_orgId: {userId, orgId}},
            include: {org: true}
        })
        if (!membership) {
            throw new NotFoundException('Organization not found')
        }
        return membership
    }

    private async uniqueSlug(name: string): Promise<string> {
        const base = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'organization'

            let slug = base
            while (await this.prisma.organization.findUnique({ where: { slug } })) {
                slug = `${base}-${randomBytes(3).toString('hex')}`
            }
        // Implementation for generating a unique slug
        return slug;
    }
}