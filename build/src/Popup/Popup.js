import html, {
  render,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from '../html.js';

import { useRunAfterUpdate } from '../hooks/useRunAfterUpdate.js';
import { isIncludedIn, removeSpecialCharacters, unique } from '../utils.js';

import * as actions from './actions.js';
import { AdvancedFilters } from './AdvancedFilters.js';
import { DownloadButton } from './DownloadButton.js';
import { DownloadConfirmation } from './DownloadConfirmation.js';
import { Images } from './Images.js';
import { UrlFilterMode } from './UrlFilterMode.js';

const initialOptions = localStorage;

const Popup = () => {
  const [options, setOptions] = useState(initialOptions);

  useEffect(() => {
    Object.assign(localStorage, options);
  }, [options]);

  const [allImages, setAllImages] = useState([]);
  const [linkedImages, setLinkedImages] = useState([]);
  const [smartImages, setSmartImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [visibleImages, setVisibleImages] = useState([]);
  useEffect(() => {
    // Get images on the page
    chrome.windows.getCurrent((currentWindow) => {
      chrome.tabs.query(
        { active: true, windowId: currentWindow.id },
        (activeTabs) => {
          chrome.scripting
            .executeScript({
              target: { tabId: activeTabs[0].id, allFrames: true },
              func: findImages,
            })
            .then((messages) => {
              setAllImages((allImages) =>
                unique([
                  ...allImages,
                  ...messages.flatMap((message) => message?.result?.allImages),
                ]),
              );

              setLinkedImages((linkedImages) =>
                unique([
                  ...linkedImages,
                  ...messages.flatMap((message) => message?.result?.linkedImages),
                ]),
              );

              // Set smart images metadata
              const newSmartImages = messages.flatMap((message) => message?.result?.smartImages || []);
              setSmartImages((existingSmartImages) => {
                const combined = [...existingSmartImages, ...newSmartImages];
                // Remove duplicates based on URL
                const seenUrls = new Set();
                return combined.filter(image => {
                  if (seenUrls.has(image.url)) {
                    return false;
                  }
                  seenUrls.add(image.url);
                  return true;
                });
              });

              localStorage.active_tab_origin = messages[0]?.result?.origin;
            });
        },
      );
    });
  }, []);

  const imagesCacheRef = useRef(null); // Not displayed; only used for filtering by natural width / height
  const filterImages = useCallback(() => {
    let visibleImages =
      options.only_images_from_links === 'true' ? linkedImages : allImages;

    let filterValue = options.filter_url;
    if (filterValue) {
      switch (options.filter_url_mode) {
        case 'normal':
          const terms = filterValue.split(/\s+/);
          visibleImages = visibleImages.filter((url) => {
            for (let index = 0; index < terms.length; index++) {
              let term = terms[index];
              if (term.length !== 0) {
                const expected = term[0] !== '-';
                if (!expected) {
                  term = term.substr(1);
                  if (term.length === 0) {
                    continue;
                  }
                }
                const found = url.indexOf(term) !== -1;
                if (found !== expected) {
                  return false;
                }
              }
            }
            return true;
          });
          break;
        case 'wildcard':
          filterValue = filterValue
            .replace(/([.^$[\]\\(){}|-])/g, '\\$1')
            .replace(/([?*+])/, '.$1');
        /* fall through */
        case 'regex':
          visibleImages = visibleImages.filter((url) => {
            try {
              return url.match(filterValue);
            } catch (error) {
              return false;
            }
          });
          break;
      }
    }

    visibleImages = visibleImages.filter((url) => {
      const image = imagesCacheRef.current.querySelector(
        `img[src="${encodeURI(url)}"]`,
      );

      return (
        (options.filter_min_width_enabled !== 'true' ||
          options.filter_min_width <= image.naturalWidth) &&
        (options.filter_max_width_enabled !== 'true' ||
          image.naturalWidth <= options.filter_max_width) &&
        (options.filter_min_height_enabled !== 'true' ||
          options.filter_min_height <= image.naturalHeight) &&
        (options.filter_max_height_enabled !== 'true' ||
          image.naturalHeight <= options.filter_max_height)
      );
    });

    setVisibleImages(visibleImages);
  }, [allImages, linkedImages, options]);

  useEffect(filterImages, [allImages, linkedImages, options]);

  const [downloadIsInProgress, setDownloadIsInProgress] = useState(false);
  const imagesToDownload = useMemo(
    () => visibleImages.filter(isIncludedIn(selectedImages)),
    [visibleImages, selectedImages],
  );

  const [downloadConfirmationIsShown, setDownloadConfirmationIsShown] =
    useState(false);

  function maybeDownloadImages() {
    if (options.show_download_confirmation === 'true') {
      setDownloadConfirmationIsShown(true);
    } else {
      downloadImages();
    }
  }

  async function downloadImages() {
    setDownloadIsInProgress(true);
    await actions.downloadImages(imagesToDownload, options, smartImages);
    setDownloadIsInProgress(false);
  }

  const runAfterUpdate = useRunAfterUpdate();

  return html`
    <div id="filters_container">
      <div style=${{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="text"
          placeholder="Filter by URL"
          title="Filter by parts of the URL or regular expressions."
          value=${options.filter_url}
          style=${{ flex: '1' }}
          onChange=${({ currentTarget: { value } }) => {
            setOptions((options) => ({ ...options, filter_url: value.trim() }));
          }}
        />

        <${UrlFilterMode}
          value=${options.filter_url_mode}
          onChange=${({ currentTarget: { value } }) => {
            setOptions((options) => ({ ...options, filter_url_mode: value }));
          }}
        />

        <button
          id="toggle_advanced_filters_button"
          class=${options.show_advanced_filters === 'true' ? '' : 'collapsed'}
          title="Toggle advanced filters"
          onClick=${() => {
            setOptions((options) => ({
              ...options,
              show_advanced_filters:
                options.show_advanced_filters === 'true' ? 'false' : 'true',
            }));
          }}
        >
          <img class="toggle" src="/images/times.svg" />
        </button>

        <button
          id="open_options_button"
          title="Options"
          onClick=${() => chrome.runtime.openOptionsPage()}
        >
          <img src="/images/cog.svg" />
        </button>
      </div>

      ${options.show_advanced_filters === 'true' &&
      html`
        <${AdvancedFilters} options=${options} setOptions=${setOptions} />
      `}
    </div>

    <div ref=${imagesCacheRef} class="hidden">
      ${allImages.map(
        (url) => html`<img src=${encodeURI(url)} onLoad=${filterImages} />`,
      )}
    </div>

    <${Images}
      options=${options}
      visibleImages=${visibleImages}
      selectedImages=${selectedImages}
      imagesToDownload=${imagesToDownload}
      setSelectedImages=${setSelectedImages}
    />

    <div
      id="downloads_container"
      style=${{
        gridTemplateColumns: `${
          options.show_file_renaming === 'true' ? 'minmax(100px, 1fr)' : ''
        } minmax(100px, 1fr) 80px`,
      }}
    >
      <input
        type="text"
        placeholder="Save to subfolder"
        title="Set the name of the subfolder you want to download the images to."
        value=${options.folder_name}
        onChange=${({ currentTarget: input }) => {
          const savedSelectionStart = removeSpecialCharacters(
            input.value.slice(0, input.selectionStart),
          ).length;

          runAfterUpdate(() => {
            input.selectionStart = input.selectionEnd = savedSelectionStart;
          });

          setOptions((options) => ({
            ...options,
            folder_name: removeSpecialCharacters(input.value),
          }));
        }}
      />

      ${options.show_file_renaming === 'true' &&
      html`
        <input
          type="text"
          placeholder="Rename files"
          title="Set a new file name for the images you want to download."
          value=${options.new_file_name}
          onChange=${({ currentTarget: input }) => {
            const savedSelectionStart = removeSpecialCharacters(
              input.value.slice(0, input.selectionStart),
            ).length;

            runAfterUpdate(() => {
              input.selectionStart = input.selectionEnd = savedSelectionStart;
            });

            setOptions((options) => ({
              ...options,
              new_file_name: removeSpecialCharacters(input.value),
            }));
          }}
        />
      `}

      <${DownloadButton}
        disabled=${imagesToDownload.length === 0}
        loading=${downloadIsInProgress}
        onClick=${maybeDownloadImages}
      />

      ${downloadConfirmationIsShown &&
      html`
        <${DownloadConfirmation}
          onCheckboxChange=${({ currentTarget: { checked } }) => {
            setOptions((options) => ({
              ...options,
              show_download_confirmation: (!checked).toString(),
            }));
          }}
          onClose=${() => setDownloadConfirmationIsShown(false)}
          onConfirm=${downloadImages}
        />
      `}
    </div>
  `;
};

function findImages() {
  // Source: https://support.google.com/webmasters/answer/2598805?hl=en
  const imageUrlRegex =
    /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:bmp|gif|ico|jfif|jpe?g|png|svg|tiff?|webp|avif))(?:\?([^#]*))?(?:#(.*))?/i;

  function extractImagesFromSelector(selector) {
    return unique(
      toArray(document.querySelectorAll(selector))
        .map(extractImageFromElement)
        .filter(isTruthy)
        .map(relativeUrlToAbsolute),
    );
  }

  function extractImageFromElement(element) {
    if (element.tagName.toLowerCase() === 'img') {
      const src = element.src;
      const hashIndex = src.indexOf('#');
      return hashIndex >= 0 ? src.substr(0, hashIndex) : src;
    }

    if (element.tagName.toLowerCase() === 'image') {
      const src = element.getAttribute('xlink:href');
      const hashIndex = src.indexOf('#');
      return hashIndex >= 0 ? src.substr(0, hashIndex) : src;
    }

    if (element.tagName.toLowerCase() === 'a') {
      const href = element.href;
      if (isImageURL(href)) {
        return href;
      }
    }

    const backgroundImage = window.getComputedStyle(element).backgroundImage;
    if (backgroundImage) {
      const parsedURL = extractURLFromStyle(backgroundImage);
      if (isImageURL(parsedURL)) {
        return parsedURL;
      }
    }
  }

  function isImageURL(url) {
    return url.indexOf('data:image') === 0 || imageUrlRegex.test(url);
  }

  function extractURLFromStyle(style) {
    return style.replace(/^.*url\(["']?/, '').replace(/["']?\).*$/, '');
  }

  function relativeUrlToAbsolute(url) {
    return url.indexOf('/') === 0 ? `${window.location.origin}${url}` : url;
  }

  function unique(values) {
    return toArray(new Set(values));
  }

  function toArray(values) {
    return [...values];
  }

  function isTruthy(value) {
    return !!value;
  }

  // Enhanced function to extract smart image metadata
  function extractSmartImageMetadata() {
    const images = [];
    
    // Find all img elements
    document.querySelectorAll('img').forEach(img => {
      const src = img.src;
      if (src && isImageURL(src)) {
        const metadata = {
          url: relativeUrlToAbsolute(src),
          alt: img.alt || '',
          title: img.title || '',
          filename: extractFilenameFromURL(src),
          smartTitle: generateSmartTitle(img),
          source: 'img',
          naturalWidth: 0, // Will be populated later
          naturalHeight: 0 // Will be populated later
        };
        images.push(metadata);
      }
    });

    // Find linked images
    document.querySelectorAll('a').forEach(link => {
      const href = link.href;
      if (href && isImageURL(href)) {
        const metadata = {
          url: relativeUrlToAbsolute(href),
          alt: '',
          title: link.title || '',
          filename: extractFilenameFromURL(href),
          smartTitle: generateSmartTitleFromLink(link),
          source: 'link',
          naturalWidth: 0,
          naturalHeight: 0
        };
        images.push(metadata);
      }
    });

    // Find background images
    document.querySelectorAll('[style*="background-image"]').forEach(element => {
      const backgroundImage = window.getComputedStyle(element).backgroundImage;
      if (backgroundImage) {
        const parsedURL = extractURLFromStyle(backgroundImage);
        if (parsedURL && isImageURL(parsedURL)) {
          const metadata = {
            url: relativeUrlToAbsolute(parsedURL),
            alt: '',
            title: element.title || '',
            filename: extractFilenameFromURL(parsedURL),
            smartTitle: generateSmartTitleFromElement(element),
            source: 'background',
            naturalWidth: 0,
            naturalHeight: 0
          };
          images.push(metadata);
        }
      }
    });

    // Remove duplicates based on URL
    const uniqueImages = [];
    const seenUrls = new Set();
    
    images.forEach(image => {
      if (!seenUrls.has(image.url)) {
        seenUrls.add(image.url);
        uniqueImages.push(image);
      }
    });

    return uniqueImages;
  }

  function extractFilenameFromURL(url) {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || 'image';
  }

  function generateSmartTitle(element) {
    let title = '';
    
    // Priority 1: alt attribute
    if (element.alt && element.alt.trim()) {
      title = element.alt.trim();
    }
    // Priority 2: title attribute
    else if (element.title && element.title.trim()) {
      title = element.title.trim();
    }
    // Priority 3: surrounding text context
    else {
      title = extractContextFromElement(element);
    }
    
    return title || extractFilenameFromURL(element.src || '');
  }

  function generateSmartTitleFromLink(link) {
    let title = '';
    
    // Priority 1: link title
    if (link.title && link.title.trim()) {
      title = link.title.trim();
    }
    // Priority 2: link text
    else if (link.textContent && link.textContent.trim()) {
      title = link.textContent.trim();
    }
    // Priority 3: parent context
    else {
      title = extractContextFromElement(link);
    }
    
    return title || extractFilenameFromURL(link.href || '');
  }

  function generateSmartTitleFromElement(element) {
    let title = '';
    
    // Priority 1: title attribute
    if (element.title && element.title.trim()) {
      title = element.title.trim();
    }
    // Priority 2: surrounding text context
    else {
      title = extractContextFromElement(element);
    }
    
    return title;
  }

  function extractContextFromElement(element) {
    // Look for nearby text content
    const parent = element.parentElement;
    if (parent) {
      // Get text from parent and siblings
      const textContent = parent.textContent || '';
      const trimmedText = textContent.trim();
      
      if (trimmedText.length > 0) {
        // Take first meaningful sentence or phrase
        const sentences = trimmedText.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 0);
        if (sentences.length > 0) {
          return sentences[0].substring(0, 100); // Limit to 100 chars
        }
      }
    }
    
    return '';
  }

  return {
    allImages: extractImagesFromSelector('img, image, a, [class], [style]'),
    linkedImages: extractImagesFromSelector('a'),
    smartImages: extractSmartImageMetadata(),
    origin: window.location.origin,
  };
}

render(html`<${Popup} />`, document.querySelector('main'));
