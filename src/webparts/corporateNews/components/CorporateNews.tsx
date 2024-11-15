import * as React from 'react';
import '../../../assets/scss/styles/index.scss';
// import styles from './CorporateNews.module.scss';
import type { ICorporateNewsProps } from './ICorporateNewsProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { ICorporateNewsItemsProps } from '../../../models';
import * as moment from 'moment';

const CorporateNews: React.FC<ICorporateNewsProps> = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
  context,
}) => {
  const [newsItems, setNewsItems] = React.useState<ICorporateNewsItemsProps[]>(
    []
  );

  const fetchCorporateNews = async (): Promise<void> => {
    try {
      const response: SPHttpClientResponse = await context.spHttpClient.get(
        `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('CorporateNews')/items?$select=ID,Title,Day,Month,Body,Date,Hyperlink,Description,TypeOfLink`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText);
      }

      const responseJson = await response.json();
      const formattedNews: ICorporateNewsItemsProps[] = responseJson.value.map(
        (item: ICorporateNewsItemsProps) => ({
          ID: item.ID,
          Title: item.Title || '',
          Day: item.Day || '',
          Month: item.Month || '',
          Body: item.Body || '',
          Date: item.Date || '',
          Hyperlink: item.Hyperlink || '',
          Description: item.Description || '',
          TypeOfLink: item.TypeOfLink || '',
        })
      );

      setNewsItems(formattedNews);
    } catch (error) {
      console.error('Error fetching corporate news:', error);
    }
  };

  React.useEffect(() => {
    fetchCorporateNews()
      .then(() => {
        // Any post-fetch logic if needed
      })
      .catch((error) => {
        console.error('Error in useEffect during fetch:', error);
      });
  }, []);

  const gotoNewInnerLink = (newsItem: ICorporateNewsItemsProps): void => {
    if (newsItem.TypeOfLink === 'Internal Page') {
      const internalUrl = `${context.pageContext.web.absoluteUrl}/Pages/CorporateNews/DispForm.aspx?ID=${newsItem.ID}`;
      window.open(internalUrl, '_blank');
    } else if (newsItem.TypeOfLink === 'External Page') {
      window.open(newsItem.Hyperlink, '_blank');
    }
  };

  const renderCorporateNews = (): JSX.Element[] | JSX.Element => {
    if (newsItems.length === 0) {
      return <p>No news available at the moment.</p>;
    }

    return newsItems.map((newsItem: ICorporateNewsItemsProps) => {
      const currentDate: Date = new Date(newsItem.Date);
      const formattedDate: string = moment(currentDate).format(
        'dddd, MMMM DD, YYYY'
      );
      return (
        <li key={newsItem.ID} className="py_20 brd_bt">
          <p
            className="text_12 fw-600 mb_5 Linkcls"
            data-LinkType={newsItem.TypeOfLink}
            onClick={() => gotoNewInnerLink(newsItem)}
            data-href={newsItem.Hyperlink}
            data-Id={newsItem.ID}
          >
            {newsItem.Title}
          </p>
          <p className="text_11 blue-color">{formattedDate}</p>
        </li>
      );
    });
  };

  return (
    <section className={''}>
      <div className="emb_news_rsp">
        <div className="org_head">
          <p className="text_20 fw-600 text_1">Corporate News</p>
        </div>
        <div className="wrapper_bdy">
          <ul className="Newulcls" id="lblCorporateNews">
            {renderCorporateNews()}
          </ul>
          <a
            href="/sites/IntranetV1/Pages/CorporateNews/AllItems.aspx"
            className="text_12 text_clr_ylo"
            target="_blank"
          >
            <span className="text_12 org-color">View all</span>
            <img
              src="/sites/IntranetV1/IntranetV1SourceCode/CommonDashboard/Common/Icons/left-arrow-right-low.svg"
              alt=""
              className="max_img_12 ml_5"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CorporateNews;
