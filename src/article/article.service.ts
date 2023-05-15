import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { UserEntity } from 'src/user/user.entity';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { IArticleResponse } from './types/articleResponse.interface';
import { getRandomString } from 'src/urtils/getRandomString';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

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

  async getArticleBySlag(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({
      where: { slug },
      relations: ['author'],
    });
  }

  buildArticleResponse(article: ArticleEntity): IArticleResponse {
    return { article };
  }

  private generateSlug(title: string): string {
    const randomString = getRandomString();
    return slugify(title, { lower: true }) + '-' + randomString;
  }
}
