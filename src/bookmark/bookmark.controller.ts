import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {

    constructor(private bookmarkService: BookmarkService) {}

    @Get()
    getBookmarks(@GetUser('id') user_id: number) {
        return this.bookmarkService.getBookmarks(user_id);
    }

    @Post()
    createBookmark(@GetUser('id') user_id: number, @Body() dto: CreateBookmarkDto) {
        return this.bookmarkService.createBookmark(user_id, dto);
    }

    @Get(':id')
    getBookmarkById(@GetUser('id') user_id: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.getBookmarkById(user_id, bookmarkId);
    }

    @Patch(':id')
    EditBookmark(@GetUser('id') user_id: number, @Param('id', ParseIntPipe) bookmarkId: number, @Body() dto: EditBookmarkDto) {
        return this.bookmarkService.EditBookmark(user_id, bookmarkId, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    DeleteBookmark(@GetUser('id') user_id: number,  @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.DeleteBookmark(user_id, bookmarkId);
    }
}
