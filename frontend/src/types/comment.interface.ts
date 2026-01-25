export interface CommentsResponseInterface {
  allCount: number;
  comments: CommentInterface[];
}

export interface CommentInterface {
  id: string;
  text: string;
  date: string;
  likesCount: number;
  dislikesCount: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  article?: string;
  updatedAt?: string;
  parentComment?: string;
  replies?: CommentInterface[];
  userLiked?: boolean;
  userDisliked?: boolean;
  userViolated?: boolean;
}
