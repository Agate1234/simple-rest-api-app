import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}

    getBookmarks(user_id: number) {
        return this.prisma.bookmark.findMany({
            where: {
                user_id
            }
        })
    }
    
    async createBookmark(user_id: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                user_id,
                ...dto
            }
        })

        return bookmark
    }
    
    getBookmarkById(user_id: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({
            where: {
                id: bookmarkId,
                user_id
            }
        })
    }
    
    async EditBookmark(user_id: number, bookmarkId: number, dto: EditBookmarkDto) {
        // get bookmark by id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        // check jika user punya bookmark tersebut
        if (!bookmark || bookmark.user_id !== user_id) {
            throw new ForbiddenException('Bookmark Tidak Ditemukan Atau Akses Ditolak')
        }

        return this.prisma.bookmark.update({
            where: {
                id: bookmarkId
            },
            data: {
                ...dto
            }
        })
    }
    
    async DeleteBookmark(user_id: number, bookmarkId: number) {
        // get bookmark by id
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId
            }
        })

        // check jika user punya bookmark tersebut
        if (!bookmark || bookmark.user_id !== user_id) {
            throw new ForbiddenException('Bookmark Tidak Ditemukan Atau Akses Ditolak')
        }

        return this.prisma.bookmark.delete({
            where: {
                id: bookmarkId
            }
        })
    }
}
