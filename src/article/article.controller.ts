import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';

import { BackendValidationPipe } from 'src/shared/pipes/backendValidation.pipe';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { IArticleQuery } from './types/articleQuery.interface';
import { IArticleResponse } from './types/articleResponse.interface';
import { IArticleQueryResponse } from './types/articleQueryResponse.interface';
import { CreateArticleDto } from './dto/createArticle.dto';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { ICommentResponse } from 'src/comment/types/ICommentResponse.interface';
import { ICommentsResponse } from 'src/comment/types/ICommentsResponse.interface';
import { UserEntity } from 'src/user/user.entity';
import { ArticleService } from './article.service';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: IArticleQuery,
  ): Promise<IArticleQueryResponse> {
    return this.articleService.findAll(currentUserId, query);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getFeed(
    @User('id') currentUserId: number,
    @Query() query: IArticleQuery,
  ): Promise<IArticleQueryResponse> {
    return await this.articleService.getFeed(currentUserId, query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async createArticle(
    @User() currentUser: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleResponse> {
    const newArticle = await this.articleService.createArticle(
      currentUser,
      createArticleDto,
    );

    return this.articleService.buildArticleResponse(newArticle);
  }

  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const articleBySlag = await this.articleService.getArticleBySlag(slug);
    return this.articleService.buildArticleResponse(articleBySlag);
  }

  @Delete(':slug')
  @UseGuards(AuthGuard)
  async deleteArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<DeleteResult> {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
    @Body('article') updateArticleDto: CreateArticleDto,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.updateArticle(
      slug,
      updateArticleDto,
      currentUserId,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async addArticleToFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.addArticleToFavorites(
      slug,
      currentUserId,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const article = await this.articleService.deleteArticleFromFavorites(
      slug,
      currentUserId,
    );

    return this.articleService.buildArticleResponse(article);
  }

  @Post(':slug/comments')
  @UseGuards(AuthGuard)
  async createComment(
    @User('') currentUser: UserEntity,
    @Body('comment') createArticleDto: CreateCommentDto,
    @Param('slug') slug: string,
  ): Promise<ICommentResponse> {
    const comment = await this.articleService.createComment(
      createArticleDto,
      slug,
      currentUser,
    );

    return this.articleService.buildCommentResponse(comment);
  }

  @Get(':slug/comments')
  async getComments(@Param('slug') slug: string): Promise<ICommentsResponse> {
    const comments = await this.articleService.getComments(slug);

    return this.articleService.buildCommentsResponse(comments);
  }
}
