export default function decorate(block) {
    [...block.children].forEach((row, r) => {
      if (r > 0) {
        const content = [...row.children][0].textContent.trim();
        const variant = block.classList.value;
        const isImageVariant = variant.includes('image') && !(variant.includes('video'));
        const isVideoVariant = variant.includes('video') && !(variant.includes('image'));
        const isTextVariant = !isImageVariant && !isVideoVariant;
  
        const nexticondiv = document.createElement('div');
        nexticondiv.classList.add('hotspot');
        nexticondiv.style.left = [...row.children][1].textContent;
        nexticondiv.style.top = [...row.children][2].textContent;
        nexticondiv.setAttribute('data', content);
  
        // Create content display element
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('hotspot-content');
  
        if (isImageVariant) {
          const link = document.createElement('a');
          link.href = `#${content.replace(/\s+/g, '')}`; // Generate the anchor link based on the content, removing spaces
          link.textContent = content; // Set the text to "Inhibitory Activity" or similar
          link.target = '_self'; // Open link in the same tab
          contentContainer.appendChild(link);
        } else if (isVideoVariant) {
          const video = document.createElement('div');
          const allowedVideoDomains = ['youtube.com', 'vimeo.com', 'sidekick-library--aem-block-collection--adobe'];
          try {
            const url = new URL(content);
            const domainCheck = (domain) => url.hostname.includes(domain);
            const isTrustedDomain = allowedVideoDomains.some(domainCheck);
            if (isTrustedDomain) {
              const div = document.createElement('div');
              div.className = 'embed-default';
  
              const iframe = document.createElement('iframe');
              iframe.src = url.href;
              iframe.setAttribute('allow', 'encrypted-media');
              iframe.setAttribute('loading', 'lazy');
  
              div.appendChild(iframe);
              video.appendChild(div);
            } else {
              video.textContent = 'This video source is not allowed.';
              contentContainer.classList.add('bgborder');
            }
          } catch (e) {
            video.textContent = 'Invalid video URL.';
            contentContainer.classList.add('bgborder');
          }
          contentContainer.appendChild(video);
        } else if (isTextVariant) {
          contentContainer.textContent = content;
          contentContainer.classList.add('bgborder');
        }
  
        // Append content container to hotspot div
        nexticondiv.appendChild(contentContainer);
        nexticondiv.addEventListener('click', () => {
          document.querySelectorAll('.hotspot').forEach((hotspot) => {
            if (hotspot !== nexticondiv) {
              hotspot.classList.remove('onclick');
            }
          });
          nexticondiv.classList.toggle('onclick');
        });
  
        row.after(nexticondiv);
        row.remove();
      }
    });
  }
  