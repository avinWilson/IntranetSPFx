import * as React from 'react';
import * as moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import '../../../assets/scss/styles';
import styles from './AwardForm.module.scss';
import type { ICorporateAwardsListItems } from '../../../models';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import {
  createSharePointListItem,
  getSharePointListEntityType,
  updateSharePointListItem,
} from '../../../services/sharePointService';

const AwardForm = ({
  context,
  handleAwardCreated,
  formData,
  isEditMode,
  editItemId,
  setFormData,
}: {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  context: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  handleAwardCreated: () => void;
  formData: ICorporateAwardsListItems;
  isEditMode: boolean;
  editItemId: number;
  setFormData: React.Dispatch<React.SetStateAction<ICorporateAwardsListItems>>;
}): JSX.Element => {
  const [uploadStatus, setUploadStatus] = React.useState<string>('');
  const [tempFile, setTempFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Fetch Form Digest for request validation
  // const getFormDigest = async (): Promise<string> => {
  //   try {
  //     const response = await fetch(
  //       `${context.pageContext.web.absoluteUrl}/_api/contextinfo`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           Accept: 'application/json;odata=nometadata',
  //           'Content-Type': 'application/json;odata=verbose',
  //           'X-RequestDigest': 'http://tempuri.org', // this can sometimes help with SharePoint
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(
  //         `Request failed with status ${response.status}: ${response.statusText}`
  //       );
  //     }

  //     const data = await response.json();

  //     const formDigestValue =
  //       data.d?.GetContextWebInformation?.FormDigestValue ||
  //       data.FormDigestValue;

  //     if (!formDigestValue) {
  //       console.error('Unexpected response format:', data);
  //       throw new Error(
  //         "Unexpected response format, missing 'FormDigestValue'"
  //       );
  //     }

  //     return formDigestValue;
  //   } catch (error) {
  //     console.error('Error fetching form digest:', error);
  //     throw error;
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const files = event.target.files;
    if (files) {
      const file = files[0];
      if (file.size / 1024 / 1024 > 8) {
        setUploadStatus('Please upload a file up to 8 MB');
        return;
      }
      setTempFile(file);
      setFormData((prevData) => ({
        ...prevData,
        Image: URL.createObjectURL(file),
      }));
      setUploadStatus('File ready to upload on submission');
    }
  };

  // Function to upload the attachment
  const uploadAttachment = async (
    itemId: number,
    file: File
  ): Promise<string> => {
    if (!file) {
      alert('Please select a file to upload.');
      return '';
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const content = arrayBufferToBase64(arrayBuffer);
        console.log(content);
        console.log(arrayBuffer);
        const uploadUrl = `${context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('CorporateAwards')/items(${itemId})/AttachmentFiles/add(FileName='${file.name}')`;

        try {
          const response = await context.spHttpClient.post(
            uploadUrl,
            SPHttpClient.configurations.v1,
            {
              headers: {
                // 'X-RequestDigest': formDigestValue,
                // Accept: 'application/json;odata=verbose',
                'Content-Type': 'application/octet-stream',
              },
              body: file,
            }
          );

          if (response.status === 403) {
            setUploadStatus('Access denied. Check your permissions.');
          }

          if (response.ok) {
            const attachmentUrl = `${context.pageContext.web.absoluteUrl}/Lists/CorporateAwards/Attachments/${itemId}/${file.name}`;
            setFormData((prevData) => ({ ...prevData, Image: attachmentUrl }));
            setUploadStatus('File uploaded successfully');
            resolve(attachmentUrl);
          } else {
            setUploadStatus('File upload failed');
            reject(new Error('File upload failed'));
          }
        } catch (error) {
          console.error('Error during file upload:', error);
          setUploadStatus('Error during file upload');
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('File reading error:', error);
        setUploadStatus('Failed to read file; please try again.');
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const createCorporateAwardsListItem = async ({
    Title,
    EmployeeName,
    AwardDate,
    AwardDescription,
    Image,
    Department,
    Email,
  }: ICorporateAwardsListItems): Promise<SPHttpClientResponse> => {
    const listName = 'CorporateAwards';
    const selectFields =
      '$select=Id,EmployeeName,AwardDate,AwardDescription,Image,Department,Email';
    const itemEntityType = await getSharePointListEntityType(
      context,
      listName,
      selectFields
    );

    const request = {
      Title: Title,
      EmployeeName: EmployeeName,
      AwardDate: AwardDate,
      AwardDescription: AwardDescription,
      Image: Image,
      Department: Department,
      Email: Email,
      '@odata.type': itemEntityType,
    };

    const response = await createSharePointListItem(context, listName, request);

    return response;
  };

  const updateImageUrlColumn = async (
    itemId: number,
    imageUrl: string
  ): Promise<SPHttpClientResponse> => {
    const listName = 'CorporateAwards';

    const response = await updateSharePointListItem(context, listName, itemId, {
      Image: imageUrl,
    });

    return response;
  };

  const SubmitRequest = async (): Promise<void> => {
    const itemData = {
      Title: formData.Title,
      EmployeeName: formData.EmployeeName,
      Email: formData.Email,
      AwardDescription: formData.AwardDescription,
      AwardDate: formData.AwardDate,
      Department: formData.Department,
      Image: formData.Image,
    };

    if (isEditMode && editItemId) {
      const listName = 'CorporateAwards';
      const response = await updateSharePointListItem(
        context,
        listName,
        editItemId,
        {
          Title: formData.Title,
          EmployeeName: formData.EmployeeName,
          Email: formData.Email,
          AwardDescription: formData.AwardDescription,
          AwardDate: formData.AwardDate,
          Department: formData.Department,
          Image: formData.Image,
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(responseText);
      }

      // Step 2: If a new image file is selected, upload it and update the image URL
      if (tempFile) {
        console.log('New image file selected during edit');
        try {
          const imageUrl = await uploadAttachment(editItemId, tempFile);
          if (imageUrl) {
            await updateImageUrlColumn(editItemId, imageUrl);
            setFormData((prevData) => ({ ...prevData, Image: imageUrl }));
          }
        } catch (error) {
          console.error('Error updating image during edit:', error);
          setUploadStatus('Error updating image during edit');
        }
      } else {
        console.log('No new image file selected during edit');
      }

      setUploadStatus('Award entry updated successfully');
    } else {
      try {
        // Step 1: Create the list item and get the ID
        const response = await createCorporateAwardsListItem(itemData);

        if (!response.ok) {
          throw new Error('Error creating list item');
        }

        const responseData = await response.json();
        const itemId = responseData.Id; // Use the created item ID

        // Step 2: Upload the file as an attachment if an image is selected
        if (tempFile) {
          const imageUrl = await uploadAttachment(itemId, tempFile);
          if (imageUrl) {
            setFormData((prevData) => ({ ...prevData, Image: imageUrl }));
            await updateImageUrlColumn(itemId, imageUrl);
            setUploadStatus('Award entry saved successfully with attachment');
          }
        } else {
          setUploadStatus('Award entry saved successfully without attachment');
        }
        // Clear form and tempFile after successful submission
        setTempFile(null);
        setFormData({
          Title: '',
          EmployeeName: '',
          Email: '',
          AwardDescription: '',
          AwardDate: new Date(),
          Department: '',
          Image: '',
        });
      } catch (error) {
        console.error('Error submitting award request:', error);
        setUploadStatus('Error submitting award request');
      }
    }

    handleAwardCreated();
  };

  const CancelAward = (): void => {
    setFormData({
      Title: '',
      EmployeeName: '',
      Email: '',
      AwardDescription: '',
      AwardDate: new Date(),
      Department: '',
      Image: '',
    });
    setUploadStatus('');
    handleAwardCreated();
  };

  const DeleteAwardImageBAL = (): void => {
    setFormData((prevData) => ({ ...prevData, Image: '' }));
    setTempFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input
    }
  };

  console.log(uploadStatus);

  React.useEffect(() => {
    return () => {
      if (formData.Image) {
        URL.revokeObjectURL(formData.Image);
      }
    };
  }, [formData.Image]);

  return (
    <div id="AwardsItem" className={`${styles.awardFormContainer}`}>
      <div className="d-flex justify-content-between mb_40">
        <div className={`${styles.previewImageWrapper}`}>
          {!formData.Image && (
            <div id="Uploaddiv">
              <p className="new-fs-lg">Choose the file to upload</p>
              <div className="upld_wrapper">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.svg"
                  id="uploadImage"
                  onChange={(e) => handleFileChange(e)}
                  aria-label="Upload file"
                  ref={fileInputRef}
                />
                <label htmlFor="uploadImage" className="uploadLabel">
                  Upload
                </label>
              </div>
            </div>
          )}

          {formData.Image && (
            <div id="UploadedImagediv">
              <img
                className="prvw_image"
                src={formData.Image}
                alt="Uploaded Preview"
              />
              <button className="deleteImageBtn" onClick={DeleteAwardImageBAL}>
                <img
                  className="max_15"
                  src="/sites/Spfx_Intranet/SPFxIntranetSourceCode/Images/icons/rubbish-bin-org.svg"
                  alt="Delete Icon"
                />
              </button>
            </div>
          )}
        </div>

        <div
          className={`d-flex form_fields_wrapper row ${styles.previewTextFieldWrap}`}
        >
          <div className="col-6">
            <div className={styles.inputWrapper}>
              <label className="new-fs-sm" htmlFor="Title">
                Title
              </label>
              <input
                type="text"
                id="Title"
                className="gry_input"
                value={formData.Title}
                onChange={handleInputChange}
                maxLength={200}
                placeholder="Title"
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className="new-fs-sm" htmlFor="EmployeeName">
                Employee Name
              </label>
              <input
                type="text"
                id="EmployeeName"
                className="gry_input"
                value={formData.EmployeeName}
                onChange={handleInputChange}
                maxLength={200}
                placeholder="Employee Name"
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className="new-fs-sm" htmlFor="Email">
                Email
              </label>
              <input
                type="text"
                id="Email"
                className="gry_input"
                value={formData.Email}
                onChange={handleInputChange}
                maxLength={75}
                placeholder="Email"
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className="new-fs-sm" htmlFor="AwardDescription">
                Description
              </label>
              <textarea
                id="AwardDescription"
                className="gry_input"
                value={formData.AwardDescription}
                onChange={handleInputChange}
                rows={4}
                placeholder="Description"
              />
            </div>
          </div>

          <div className="col-6">
            <div className={styles.inputWrapper}>
              <label className="new-fs-sm" htmlFor="Department">
                Department
              </label>
              <input
                type="text"
                id="Department"
                className="gry_input"
                value={formData.Department}
                onChange={handleInputChange}
                maxLength={200}
                placeholder="Department"
              />
            </div>
            <div className={styles.inputWrapper}>
              <label className="new-fs-sm" htmlFor="AwardDate">
                Award Date
              </label>
              <input
                type="text"
                id="AwardDate"
                className="gry_input"
                value={moment(formData.AwardDate).format('MM/DD/YYYY')}
                readOnly
                placeholder="Award Date"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="button_group">
        <button className="btn" onClick={SubmitRequest}>
          Save
        </button>
        <button className="btn" onClick={CancelAward}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AwardForm;
