import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
} from './aem.js';

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

// Helper function to convert absolute URLs to relative
function convertToRelative(href) {
    const url = new URL(href, window.location.origin);
    return url.pathname + url.search + url.hash;
}

// Helper function to generate a valid id from the relative URL
function generateId(href) {
  const url = convertToRelative(href);
  return url.pathname.replace(/[^\w-]+/g, '_') + url.search.replace(/[^\w-]+/g, '_') + url.hash.replace(/[^\w-]+/g, '_');
}

function decorateLinks(main) {
  // Get all anchor elements within the main container
  const links = main.querySelectorAll('a');
  
  // Helper function to convert absolute URLs to relative
  function convertToRelative(href) {
      const url = new URL(href, window.location.origin);
      return url.pathname + url.search + url.hash;
  }

  // Counter to generate unique ids for each internal link
  let linkCounter = 0;
  
  // Loop through each anchor element
  links.forEach((link) => {
      const { href, title } = link;

      // Convert to relative URL if the link is within the same domain
      if (href.startsWith(window.location.origin)) {
          const relativeHref = convertToRelative(href);
          link.setAttribute('href', relativeHref);
      }

      // Generate a unique id for each internal link
      linkCounter++;
      const uniqueId = `link-${linkCounter}`;
      link.setAttribute('id', uniqueId);

      // If the link has a hash (indicating an internal reference), add a reverse link
      if (link.hash) {
          const targetId = link.hash.substring(1); // Get the target ID without the '#' character
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
              // Check if a reverse link with the specific href already exists in the target element
              const reverseLinkSelector = `a[href="#${uniqueId}"]`;
              const existingReverseLink = targetElement.querySelector(reverseLinkSelector);
              
              if (!existingReverseLink) {
                  // Create a reverse reference link only if it doesn't exist
                  const reverseRef = document.createElement('a');
                  reverseRef.href = `#${uniqueId}`; // Use the unique id as the reverse reference
                  reverseRef.textContent = '↩ Back to reference';
                  reverseRef.style.display = 'block';
                  reverseRef.style.fontSize = '0.9em';
                  reverseRef.style.color = '#007bff';

                  // Append the reverse reference to the target element
                  targetElement.appendChild(reverseRef);
              }
          }
      }

      // Additional functionality for reverse linking in the enclosing paragraph
      const parentParagraph = link.closest('p');
      if (parentParagraph) {
          const paragraphText = parentParagraph.textContent;
          const firstSentenceMatch = paragraphText.match(/^(\d+\.)/);

          if (firstSentenceMatch) {
              const referenceNumber = firstSentenceMatch[0].trim();
              const existingReferenceLink = parentParagraph.querySelector(`a[href="#${link.id}"]`);

              if (!existingReferenceLink) {
                  const referenceLink = document.createElement('a');
                  referenceLink.href = `#${link.id}`;
                  referenceLink.textContent = referenceNumber;
                  referenceLink.style.color = '#007bff';

                  // Insert the reference link at the start of the paragraph
                  parentParagraph.innerHTML = referenceLink.outerHTML + paragraphText.replace(referenceNumber, '');
              }
          }
      }
  });
}











/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateLinks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
