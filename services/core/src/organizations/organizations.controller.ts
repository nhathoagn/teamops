 import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
 import { AuthGuard } from '@nestjs/passport'
 import { CurrentUser } from '../auth/decorators/current-user.decorator'
 import { JwtPayload } from '../auth/types/jwt-payload.type'
 import { CreateOrganizationDto } from './dto/create-organization.dto'
 import { UpdateOrganizationDto } from './dto/update-organization.dto'
 import { OrganizationsService } from './organizations.service'
 
@Controller('organizations')
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) {}

    @Post()
    create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrganizationDto) {
        return this.organizationsService.create(user.sub, dto)
    }

    @Get()
    findAll(@CurrentUser() user: JwtPayload) {
        return this.organizationsService.findAll(user.sub)
    }

    @Get(':orgId')
    findOne(@CurrentUser() user: JwtPayload, @Param('orgId') orgId: string) {
        return this.organizationsService.findOne(user.sub, orgId)
    }

    @Patch(':orgId')
    update(
        @CurrentUser() user: JwtPayload,
        @Param('orgId') orgId: string,
        @Body() dto: UpdateOrganizationDto
    ) {
        return this.organizationsService.update(user.sub, orgId, dto)
    }
}