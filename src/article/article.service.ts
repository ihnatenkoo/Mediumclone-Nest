import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import slugify from 'slugify';

import { CreateArticleDto } from './dto/createArticle.dto';
import { IArticleQuery } from './types/articleQuery.interface';
import { IArticleQueryResponse } from './types/articleQueryResponse.interface';
import { IArticleResponse } from './types/articleResponse.interface';
import { ArticleType } from './types/article.type';
import { UserEntity } from 'src/user/user.entity';
import { ArticleEntity } from './article.entity';
import { FollowEntity } from 'src/profile/follow.entity';
import { getRandomString } from 'src/utils/getRandomString';
import { CreateCommentDto } from 'src/comment/dto/createComment.dto';
import { CommentEntity } from 'src/comment/comment.entity';
import { ICommentResponse } from 'src/comment/types/ICommentResponse.interface';
import { ICommentsResponse } from 'src/comment/types/ICommentsResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  async findAll(
    currentUserId: number,
    query: IArticleQuery,
  ): Promise<IArticleQueryResponse> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });

      queryBuilder.andWhere('articles.authorId = :id', {
        id: author?.id,
      });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      const ids = author.favorites.map((favorite) => favorite.id);

      if (ids.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.limit) {
      queryBuilder.limit(Number(query.limit));
    }

    if (query.offset) {
      queryBuilder.offset(Number(query.offset));
    }

    const articles = await queryBuilder.getMany();

    let articlesWithFavorites: Array<ArticleType> = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });

      const favoriteIds: Array<number> = currentUser.favorites.map(
        (favorite) => favorite.id,
      );

      articlesWithFavorites = articles.map((article) => {
        const favorited = favoriteIds.includes(article.id);
        return { ...article, favorited };
      });
    } else {
      articlesWithFavorites = articles.map((article) => {
        return { ...article, favorited: false };
      });
    }

    return { articles: articlesWithFavorites, articlesCount };
  }

  async getFeed(
    currentUserId: number,
    query: IArticleQuery,
  ): Promise<IArticleQueryResponse> {
    const follows = await this.followRepository.find({
      where: { followerId: currentUserId },
    });

    if (!follows.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

    queryBuilder.addOrderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(Number(query.limit));
    }

    if (query.offset) {
      queryBuilder.offset(Number(query.offset));
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    article.author = currentUser;

    article.slug = this.generateSlug(createArticleDto.title);

    if (!article.tagList) {
      article.tagList = [];
    }

    return await this.articleRepository.save(article);
  }

  async getArticleBySlag(
    slug: string,
    relations: string[] = [],
  ): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations,
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.getArticleBySlag(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    updateArticleDto: CreateArticleDto,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlag(slug);

    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    if (article.title !== updateArticleDto.title) {
      article.slug = this.generateSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlag(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const isFavorite = user.favorites.some(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (!isFavorite) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlag(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const favoriteArticleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id,
    );

    if (favoriteArticleIndex > -1) {
      user.favorites.splice(favoriteArticleIndex, 1);
      article.favoritesCount--;
      await this.articleRepository.save(article);
      await this.userRepository.save(user);
    }

    return article;
  }

  async createComment(
    createArticleDto: CreateCommentDto,
    slug: string,
    currentUser: UserEntity,
  ): Promise<CommentEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    const comment = new CommentEntity();
    Object.assign(comment, createArticleDto);

    comment.author = currentUser;
    comment.article = article;

    const newComment = await this.commentRepository.save(comment);
    delete newComment.article;

    return newComment;
  }

  async getComments(slug: string): Promise<CommentEntity[]> {
    const article = await this.getArticleBySlag(slug, ['comments']);

    if (!article) {
      throw new HttpException('Article not found ', HttpStatus.NOT_FOUND);
    }

    return article.comments;
  }

  async deleteComment(
    slug: string,
    commentId: number,
    currentUserId: number,
  ): Promise<void> {
    const comments = await this.getComments(slug);
    const comment = comments.find((c) => c.id === Number(commentId));

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    if (comment.author.id !== currentUserId) {
      throw new HttpException('Comment not owned by you', HttpStatus.FORBIDDEN);
    }

    await this.commentRepository.delete({ id: commentId });
  }

  buildArticleResponse(article: ArticleEntity): IArticleResponse {
    return { article };
  }

  buildCommentResponse(comment: CommentEntity): ICommentResponse {
    return { comment };
  }

  buildCommentsResponse(comments: CommentEntity[]): ICommentsResponse {
    return { comments };
  }

  private generateSlug(title: string): string {
    const randomString = getRandomString();
    return slugify(title, { lower: true }) + '-' + randomString;
  }
}
