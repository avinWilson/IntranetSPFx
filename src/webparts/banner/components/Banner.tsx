import * as React from 'react';
import * as $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import '../../../assets/scss/styles';
import './Banner.scss';
import styles from './Banner.module.scss';
import OwlCarousel from 'react-owl-carousel';
import { Modal, Spinner } from 'react-bootstrap';
import type { IBannerProps } from './IBannerProps';
import { IMediaGalleryListsItems } from '../../../models';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

const Banner: React.FC<IBannerProps> = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
  context,
}) => {
  const [mediaGalleryLists, setMediaGalleryLists] = React.useState<
    IMediaGalleryListsItems[]
  >([]);
  const [currentMedia, setCurrentMedia] = React.useState<{
    title: string;
    description: string;
    linkText: string;
    linkUrl: string;
  } | null>(null);
  const [showMediaModal, setShowMediaModal] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  const handleClose = (): void => setShowMediaModal(false);
  const handleShow = (): void => setShowMediaModal(true);

  const fetchMediaGalleryLists = async (): Promise<void> => {
    try {
      // console.log('Fetching data...');
      const response: SPHttpClientResponse = await context.spHttpClient.get(
        `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('MediaGallery')/items?$select=Id,Title,URL,MediaType,ThumbnailURL,VideoFrom,LinkURL,LinkText,Description&$filter=IsActive eq 'Yes'&$OrderBy=OrderNumber,Created desc&$top=10`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        const responseText: string = await response.text();
        throw new Error(responseText);
      }

      const responseJson = await response.json();

      const formattedMediaGalleryLists: IMediaGalleryListsItems[] =
        responseJson.value.map((item: IMediaGalleryListsItems) => ({
          Id: item.Id || '',
          Title: item.Title || '',
          URL: item.URL || '',
          MediaType: item.MediaType || '',
          Description: item.Description || '',
          ThumbnailURL: item.ThumbnailURL || '',
          VideoFrom: item.VideoFrom || '',
          LinkURL: item.LinkURL || '',
          LinkText: item.LinkText || '',
        }));

      // console.log('Response received:', response);
      // console.log('Formatted data:', formattedMediaGalleryLists);
      setMediaGalleryLists(formattedMediaGalleryLists);
    } catch (error) {
      console.error('Error fetching media gallery lists:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMediaGalleryLists()
      .then(() => {
        // Any post-fetch logic if needed
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching media gallery lists:', error);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    $(document).ready(() => {
      console.log('jQuery initialized for Banner component');
    });
  }, []);

  const showMedia = (media: IMediaGalleryListsItems): void => {
    setCurrentMedia({
      title: media.Title,
      description: media.Description,
      linkText: media.LinkText,
      linkUrl: media.LinkURL,
    });
    handleShow();
  };

  console.log('banner loaded successfully');
  // console.log('jQuery Loaded:', window.jQuery !== undefined);

  return (
    <>
      {/* Loader */}
      {loading && (
        <div className={styles.loaderContainer}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* <img src={svg} alt="" />
      <img src={png} alt="" /> */}
      {/* <span dangerouslySetInnerHTML={{ __html: svg }}></span> */}

      <div className="het_450 Hod mediaGallery">
        {mediaGalleryLists.length === 0 ? (
          <p>No data available at the moment.</p>
        ) : (
          <OwlCarousel
            className="owl-theme"
            loop={true}
            margin={10}
            items={1}
            autoplay={true}
            dots={false}
            nav={true}
          >
            {mediaGalleryLists.map((media: IMediaGalleryListsItems) => {
              const shortDescription =
                media.Description.length > 60
                  ? `${media.Description.substring(0, 60)}...`
                  : media.Description;

              const mediaUrl =
                media.LinkURL.indexOf('https://') === -1
                  ? `https://${media.URL}`
                  : media.URL;

              if (media.MediaType === 'Image') {
                return (
                  <div className={`${styles.item} d-flex flex-column h-100`}>
                    <div className={`${styles.bannerImage} d-flex`}>
                      <img src={media.ThumbnailURL} />
                    </div>
                    <div
                      className={`${styles.bannerText} w-100 mt-0 overflow-hidden`}
                      id={`Media_${media.Id}`}
                    >
                      <p
                        className={`${styles.bannerTitle} new-fs-lg fw-600 mb-2`}
                        id="bnrTitle"
                      >
                        {media.Title}
                      </p>
                      <p className="new-fs-sm hm_banner_desp mb-1">
                        {shortDescription}
                        {media.Description.length > 60 && (
                          <a
                            href=""
                            className="txt_white_banner cursor"
                            onClick={(
                              e: React.MouseEvent<HTMLAnchorElement>
                            ) => {
                              e.stopPropagation();
                              e.preventDefault();
                              showMedia(media);
                            }}
                          >
                            more
                          </a>
                        )}
                      </p>
                      <p
                        className="new-fs-sm hm_banner_desp"
                        id="hidDesc"
                        style={{ display: 'none' }}
                      >
                        {media.Description}
                      </p>
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="d-inline-block new-fs-sm txt_ylo_banner new-link w-75"
                        id="lnkBanner"
                      >
                        {media.LinkText}
                      </a>
                    </div>
                  </div>
                );
              } else if (media.MediaType === 'Video') {
                return (
                  <div
                    className={`${styles.item} item-video d-flex flex-column h-100`}
                  >
                    <div className={`${styles.bannerImage} d-flex`}>
                      <video className="YouTubeVideo" controls width="100%">
                        <source src={media.URL} type="video/youtube" />
                      </video>
                    </div>
                    <div
                      className={`${styles.bannerText} w-100 mt-0 overflow-hidden`}
                      id={`Media_${media.Id}`}
                    >
                      <p
                        className={`${styles.bannerTitle} new-fs-lg fw-600 mb-2`}
                        id="bnrTitle"
                      >
                        {media.Title}
                      </p>
                      <p className="new-fs-sm hm_banner_desp mb-1">
                        {shortDescription}
                        {media.Description.length > 60 && (
                          <a
                            href=""
                            className="txt_white_banner cursor"
                            onClick={(
                              e: React.MouseEvent<HTMLAnchorElement>
                            ) => {
                              e.stopPropagation();
                              e.preventDefault();
                              showMedia(media);
                            }}
                          >
                            more
                          </a>
                        )}
                      </p>
                      <p
                        className="new-fs-sm hm_banner_desp"
                        id="hidDesc"
                        style={{ display: 'none' }}
                      >
                        {media.Description}
                      </p>
                      <a
                        href={mediaUrl}
                        rel="noreferrer"
                        target="_blank"
                        className="new-fs-sm txt_ylo_banner new-link"
                      >
                        {media.LinkText}
                      </a>
                    </div>
                  </div>
                );
              }
            })}
          </OwlCarousel>
        )}
      </div>

      <Modal show={showMediaModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{currentMedia?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{currentMedia?.description}</p>
          <a href={currentMedia?.linkUrl} className="txt_ylo_banner_popup">
            {currentMedia?.linkText}
          </a>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Banner;
