export interface IMediaGalleryListsItems {
  Id: number;
  Title: string;
  URL: string;
  MediaType: 'Image' | 'Video';
  Description: string;
  ThumbnailURL: string;
  VideoFrom: 'Link' | 'SharePoint';
  LinkURL: string;
  LinkText: string;
}
