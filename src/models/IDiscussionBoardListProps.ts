export interface IDiscussionBoardListProps {
  Id: number;
  Body: string;
  Created: Date;
  Modified: Date;
  IsQuestion: boolean;
  Subject?: string;
  Title: string;
  Author: {
    Title: string;
    Id: number;
  };
  Editor: {
    Title: string;
    Id: number;
  };
  DiscussionLastUpdated: Date;
  Folder: {
    ItemCount: number;
  };
  LastReplyBy: {
    Title?: string;
  };
}
