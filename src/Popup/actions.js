export const downloadImages = (imagesToDownload, options, smartImages = []) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'downloadImages', imagesToDownload, options, smartImages },
      resolve
    );
  });
};
