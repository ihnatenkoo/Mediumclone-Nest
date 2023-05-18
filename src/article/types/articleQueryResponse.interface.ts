import { ArticleType } from './article.type';

export interface IArticleQueryResponse {
  articles: Array<ArticleType>;
  articlesCount: number;
}
