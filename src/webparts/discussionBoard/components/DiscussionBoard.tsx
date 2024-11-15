import * as React from 'react';
import '../../../assets/scss/styles/index.scss';
import type { IDiscussionBoardProps } from './IDiscussionBoardProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IDiscussionBoardListProps } from '../../../models/IDiscussionBoardListProps';
import * as moment from 'moment';

const DiscussionBoard: React.FC<IDiscussionBoardProps> = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
  context,
}) => {
  const [discussionBoardList, setDiscussionBoardList] = React.useState<
    IDiscussionBoardListProps[]
  >([]);

  const fetchDiscussionBoard = async (): Promise<void> => {
    try {
      const response: SPHttpClientResponse = await context.spHttpClient.get(
        `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('DiscussionForum')/items?$select=Id,Title,Body,DiscussionLastUpdated,Folder/ItemCount,Created,Modified,IsQuestion,Author/Title,Author/Id,Editor/Title,Editor/Id,LastReplyBy/Title&$filter=(ContentType eq 'Discussion')&$OrderBy=DiscussionLastUpdated desc&$top=10&$expand=Folder,LastReplyBy,Author,Editor`,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        const responseText: string = await response.text();
        throw new Error(responseText);
      }

      const responseJson = await response.json();
      const formattedDiscussionBoard: IDiscussionBoardListProps[] =
        responseJson.value.map((item: IDiscussionBoardListProps) => ({
          Id: item.Id || '',
          Body: item.Body || '',
          Created: item.Created || '',
          Modified: item.Modified || '',
          IsQuestion: item.IsQuestion || '',
          Title: item.Title || '',
          Author: item.Author.Title || '',
          Editor: item.Editor.Title || '',
          AuthorID: item.Author.Id || '',
          EditorID: item.Editor.Id || '',
          DiscussionLastUpdated: item.DiscussionLastUpdated || '',
          FolderCount: item.Folder.ItemCount || '',
          LastReplyBy: item.LastReplyBy.Title || '',
        }));

      setDiscussionBoardList(formattedDiscussionBoard);
    } catch (error) {
      console.error('Error fetching discussion board:', error);
    }
  };

  React.useEffect(() => {
    fetchDiscussionBoard()
      .then(() => {
        // Any post-fetch logic if needed
      })
      .catch((error) => {
        console.error('Error fetching discussion board:', error);
      });
  }, []);

  // Handle the new form opening
  const GotoNewform = (): void => {
    const newFormUrl = `${context.pageContext.web.absoluteUrl}/Lists/DiscussionForum/NewForm.aspx`;
    window.open(newFormUrl, '_blank');
  };

  const renderDiscussionBoard = (): JSX.Element | JSX.Element[] => {
    if (discussionBoardList.length === 0) {
      return <p>No discussion available at the moment.</p>;
    }

    return discussionBoardList.map((item: IDiscussionBoardListProps) => {
      const currentDate: string = moment(item.Created.toISOString()).format(
        'dddd, MMMM DD, YYYY'
      );

      return (
        <li key={item.Id} className="py_20 brd_bt">
          <a
            className="text_12 fw-600 mb_5 Linkcls"
            href={`/sites/IntranetV1/Pages/DiscussionBoard/DispForm.aspx?RequestId=${item.Id}`}
            target="_blank"
            rel="noreferrer"
          >
            {item.Title}
          </a>
          <p className="text_11 blue-color">
            By {item.Author} | {currentDate}
          </p>
        </li>
      );
    });
  };

  return (
    <div className="bg_white ht_100 calendar">
      <div className="org_head">
        <p className="text_20 fw-600 mb_10">Discussion Board</p>
      </div>
      <div
        className="d-flex"
        style={{ cursor: 'pointer' }}
        onClick={GotoNewform}
      >
        <span className="upld_wrp_numb buttoncls">+</span>
        <p className="wrp_txt">new discussion</p>
      </div>
      <div className="wrapper_bdy">
        <ul className="p_0 max_ht_320 sm_scrl mb_20" id="lblDiscussionBoard">
          {renderDiscussionBoard()}
        </ul>
        <a
          href="/sites/IntranetV1/Pages/DiscussionBoard/AllItems.aspx"
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
  );
};

export default DiscussionBoard;
