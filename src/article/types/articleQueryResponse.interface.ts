import { ArticleEntity } from '../article.entity';

export interface IArticleQueryResponse {
  articles: Array<ArticleEntity>;
  articlesCount: number;
}
