import * as React from 'react';
import * as $ from 'jquery';
import * as moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import '../../../assets/scss/styles';
import styles from './CorporateAwards.module.scss';
import type { ICorporateAwardsProps } from './ICorporateAwardsProps';
import type { ICorporateAwardsListItems } from '../../../models';
import { SPHttpClientResponse } from '@microsoft/sp-http';
import AwardForm from './AwardForm';
import {
  getSharePointListItems,
  deleteSharePointListItem,
} from '../../../services/sharePointService';
import { Modal } from 'react-bootstrap';

const CorporateAwards: React.FC<ICorporateAwardsProps> = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
  context,
}) => {
  const [corporateAwardsLists, setCorporateAwardsLists] = React.useState<
    ICorporateAwardsListItems[]
  >([]);
  const [showAwardListsWrapper, setShowAwardListsWrapper] =
    React.useState<boolean>(true);
  const [showAwardForm, setShowAwardForm] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);
  const [editItemId, setEditItemId] = React.useState<number>(0);
  const [formData, setFormData] = React.useState<ICorporateAwardsListItems>({
    Title: '',
    EmployeeName: '',
    Email: '',
    AwardDescription: '',
    AwardDate: new Date(),
    Department: '',
    Image: '',
  });
  const [showDeletePopup, setShowDeletePopup] = React.useState<boolean>(false);
  const [deleteItemData, setDeleteItemData] =
    React.useState<ICorporateAwardsListItems | null>(null);

  const fetchCorporateAwardsLists = async (): Promise<void> => {
    try {
      const response = await getSharePointListItems(
        context,
        'CorporateAwards',
        '$select=Title,Id,EmployeeName,AwardDate,AwardDescription,Image,Department,Email',
        '$top=10&$orderby=Id desc'
      );

      if (!response.ok) {
        const responseText: string = await response.text();
        throw new Error(responseText);
      }

      const responseJson = await response.json();

      const formattedCorporateAwardsLists: ICorporateAwardsListItems[] =
        responseJson.value.map((item: ICorporateAwardsListItems) => ({
          Id: item.Id || 0,
          EmployeeName: item.EmployeeName || '',
          AwardDate: item.AwardDate || '',
          AwardDescription: item.AwardDescription,
          Image: item.Image || '',
          Title: item.Title || '',
          Department: item.Department || '',
          Email: item.Email || '',
        }));

      setCorporateAwardsLists(formattedCorporateAwardsLists);
    } catch (error) {
      console.log('Error fetching corporateAwardsLists:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCorporateAwardsListItem = (
    editItem: ICorporateAwardsListItems
  ): void => {
    setIsEditMode(true);
    if (editItem.Id) setEditItemId(editItem.Id);
    setFormData(editItem);
    setShowAwardForm(true);
    setShowAwardListsWrapper(false);
    console.log(editItem);
  };

  const deleteCorporateAwardsListItem = async (
    item: ICorporateAwardsListItems
  ): Promise<SPHttpClientResponse> => {
    const listName = 'CorporateAwards';
    const filterField = 'Title';
    const response = await deleteSharePointListItem(
      context,
      listName,
      filterField,
      item[filterField]
    );

    return response;
  };

  const handleDeleteItem = async (
    item: ICorporateAwardsListItems
  ): Promise<void> => {
    setShowDeletePopup(true);
    setDeleteItemData(item);
  };

  const deleteItem = async (item: ICorporateAwardsListItems): Promise<void> => {
    try {
      await deleteCorporateAwardsListItem(item);

      await fetchCorporateAwardsLists();
    } catch (error) {
      console.log('Error deleting item:', error);
    }
    setShowDeletePopup(false);
  };

  const confirmDeleteItem = async (): Promise<void> => {
    if (deleteItemData) await deleteItem(deleteItemData);
    setShowDeletePopup(false);
  };

  const handleAwardCreated = async (): Promise<void> => {
    await fetchCorporateAwardsLists();
    setShowAwardListsWrapper(true);
    setShowAwardForm(false);
  };

  React.useEffect(() => {
    fetchCorporateAwardsLists()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.log('Error fetching corporateAwardsLists:', error);
      });
  }, []);

  const InitiateCreateForm = (): void => {
    setShowAwardForm(true);
    setShowAwardListsWrapper(false);
  };

  console.log(loading, 'loading');

  React.useEffect(() => {
    $(document).ready(() => {
      console.log('jQuery initialized for Banner component');
    });
  }, []);

  return (
    <>
      <section className="main_container pb_50">
        <div className="main_wrapper full_width_wrapper p_20 bg_white">
          <div className="addNewMediaHeadWrapper">
            <p className="new-fs-xl fw-700 text_1">Corporate Awards</p>
            <div className="btn_grp_wrapper ml-auto">
              <button
                className={`btn btn_clr_1 ${styles.addNewBtn}`}
                onClick={InitiateCreateForm}
              >
                ADD NEW
              </button>
            </div>
          </div>

          <div className={`${styles.adminManageGalleryBody}`}>
            {showAwardListsWrapper && (
              <ul id="award" className={`${styles.adminManageGalleryWrapper}`}>
                {corporateAwardsLists.length > 0 ? (
                  corporateAwardsLists.map(
                    (item: ICorporateAwardsListItems, index: number) => {
                      const formattedData = moment(item.AwardDate).format(
                        'Do MMMM YYYY'
                      );

                      return (
                        <>
                          <li
                            key={index}
                            className={`d-flex item ${styles.adminManageGalleryItems}`}
                            id={`IntranetSolAward_${item.Id}`}
                          >
                            <div className={`${styles.imageWrapper}`}>
                              <img
                                src={item.Image}
                                className="new_join_dp"
                                alt="Corporate image"
                                id="imageId"
                              />
                            </div>
                            <div className={`${styles.textWrapper}`}>
                              <p
                                className="new-fs-lg fw-700 text-org"
                                id="NameId"
                              >
                                {item.EmployeeName}
                              </p>
                              <p className="new-fs-md" id="DateId">
                                {formattedData}
                              </p>
                              <p className="new-fs-md" id="EmailId">
                                {item.Email}
                              </p>
                              <p className="new-fs-md" id="DepartId">
                                {item.Department}
                              </p>
                              <p className="new-fs-md" id="DesId">
                                {item.AwardDescription}
                              </p>
                            </div>
                            <div className={`d-flex ${styles.btnWrapper}`}>
                              <a
                                className="op_0"
                                onClick={() =>
                                  updateCorporateAwardsListItem(item)
                                }
                              >
                                <img
                                  className="max_15"
                                  src={require('../../../assets/images/icons/edit-org.svg')}
                                  alt=""
                                />
                              </a>
                              <a
                                className="op_0"
                                onClick={() => handleDeleteItem(item)}
                              >
                                <img
                                  className="max_15"
                                  src={require('../../../assets/images/icons/rubbish-bin-org.svg')}
                                  alt=""
                                />
                              </a>
                            </div>
                          </li>
                        </>
                      );
                    }
                  )
                ) : (
                  <>No records found</>
                )}
              </ul>
            )}
          </div>
          {showAwardForm && (
            <AwardForm
              context={context}
              handleAwardCreated={handleAwardCreated}
              formData={formData}
              isEditMode={isEditMode}
              editItemId={editItemId}
              setFormData={setFormData}
            />
          )}
        </div>
      </section>
      <Modal
        show={showDeletePopup}
        onHide={() => setShowDeletePopup(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this item?</p>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn_clr_1 clsbtnQuiz"
            onClick={confirmDeleteItem}
          >
            Yes
          </button>
          <button
            type="button"
            className="btn btn_clr_1 clsbtnQuiz"
            onClick={() => {
              setDeleteItemData(null);
              setShowDeletePopup(false);
            }}
          >
            No
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CorporateAwards;
