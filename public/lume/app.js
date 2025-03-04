// Mock data for placeholder icons
const icons = [
    { id: 'arrow-down', name: 'Arrow Down', category: 'interface', path: '/Solid/arrow-down.svg' },
    { id: 'arrow-left', name: 'Arrow Left', category: 'interface', path: '/Solid/arrow-left.svg' },
    { id: 'arrow-right', name: 'Arrow Right', category: 'interface', path: '/Solid/arrow-right.svg' },
    { id: 'arrow-up', name: 'Arrow Up', category: 'interface', path: '/Solid/arrow-up.svg' },
    { id: 'bell', name: 'Bell', category: 'communication', path: '/Solid/bell.svg' },
    { id: 'bell-slash', name: 'Bell Slash', category: 'communication', path: '/Solid/bell-slash.svg' },
    { id: 'bookmark', name: 'Bookmark', category: 'interface', path: '/Solid/bookmark.svg' },
    { id: 'calendar', name: 'Calendar', category: 'interface', path: '/Solid/calendar.svg' },
    { id: 'camera', name: 'Camera', category: 'media', path: '/Solid/camera.svg' },
    { id: 'chart-pie', name: 'Chart Pie', category: 'interface', path: '/Solid/chart-pie.svg' },
    { id: 'check-circle', name: 'Check Circle', category: 'interface', path: '/Solid/check-circle.svg' },
    { id: 'chevron-circle-down', name: 'Chevron Circle Down', category: 'interface', path: '/Solid/chevron-circle-down.svg' },
    { id: 'chevron-circle-left', name: 'Chevron Circle Left', category: 'interface', path: '/Solid/chevron-circle-left.svg' },
    { id: 'chevron-circle-right', name: 'Chevron Circle Right', category: 'interface', path: '/Solid/chevron-circle-right.svg' },
    { id: 'chevron-circle-up', name: 'Chevron Circle Up', category: 'interface', path: '/Solid/chevron-circle-up.svg' },
    { id: 'chevron-down', name: 'Chevron Down', category: 'interface', path: '/Solid/chevron-down.svg' },
    { id: 'chevron-left', name: 'Chevron Left', category: 'interface', path: '/Solid/chevron-left.svg' },
    { id: 'chevron-right', name: 'Chevron Right', category: 'interface', path: '/Solid/chevron-right.svg' },
    { id: 'chevron-up', name: 'Chevron Up', category: 'interface', path: '/Solid/chevron-up.svg' },
    { id: 'clock', name: 'Clock', category: 'interface', path: '/Solid/clock.svg' },
    { id: 'comment', name: 'Comment', category: 'communication', path: '/Solid/comment.svg' },
    { id: 'comment-dots', name: 'Comment Dots', category: 'communication', path: '/Solid/comment-dots.svg' },
    { id: 'comments', name: 'Comments', category: 'communication', path: '/Solid/comments.svg' },
    { id: 'compass', name: 'Compass', category: 'interface', path: '/Solid/compass.svg' },
    { id: 'copy', name: 'Copy', category: 'interface', path: '/Solid/copy.svg' },
    { id: 'coupon', name: 'Coupon', category: 'interface', path: '/Solid/coupon.svg' },
    { id: 'credit-card', name: 'Credit Card', category: 'interface', path: '/Solid/credit-card.svg' },
    { id: 'desktop', name: 'Desktop', category: 'devices', path: '/Solid/desktop.svg' },
    { id: 'discount', name: 'Discount', category: 'interface', path: '/Solid/discount.svg' },
    { id: 'download', name: 'Download', category: 'interface', path: '/Solid/download.svg' },
    { id: 'envelope', name: 'Envelope', category: 'communication', path: '/Solid/envelope.svg' },
    { id: 'exclamation-circle', name: 'Exclamation Circle', category: 'interface', path: '/Solid/exclamation-circle.svg' },
    { id: 'eye', name: 'Eye', category: 'interface', path: '/Solid/eye.svg' },
    { id: 'eye-slash', name: 'Eye Slash', category: 'interface', path: '/Solid/eye-slash.svg' },
    { id: 'file', name: 'File', category: 'interface', path: '/Solid/file.svg' },
    { id: 'film', name: 'Film', category: 'media', path: '/Solid/film.svg' },
    { id: 'filter', name: 'Filter', category: 'interface', path: '/Solid/filter.svg' },
    { id: 'flag', name: 'Flag', category: 'interface', path: '/Solid/flag.svg' },
    { id: 'folder', name: 'Folder', category: 'interface', path: '/Solid/folder.svg' },
    { id: 'globe', name: 'Globe', category: 'interface', path: '/Solid/globe.svg' },
    { id: 'headphones', name: 'Headphones', category: 'devices', path: '/Solid/headphones.svg' },
    { id: 'heart', name: 'Heart', category: 'interface', path: '/Solid/heart.svg' },
    { id: 'home', name: 'Home', category: 'interface', path: '/Solid/home.svg' },
    { id: 'image', name: 'Image', category: 'media', path: '/Solid/image.svg' },
    { id: 'inbox', name: 'Inbox', category: 'communication', path: '/Solid/inbox.svg' },
    { id: 'info-circle', name: 'Info Circle', category: 'interface', path: '/Solid/info-circle.svg' },
    { id: 'link', name: 'Link', category: 'interface', path: '/Solid/link.svg' },
    { id: 'lock', name: 'Lock', category: 'interface', path: '/Solid/lock.svg' },
    { id: 'log-in', name: 'Log In', category: 'interface', path: '/Solid/log-in.svg' },
    { id: 'log-out', name: 'Log Out', category: 'interface', path: '/Solid/log-out.svg' },
    { id: 'map', name: 'Map', category: 'interface', path: '/Solid/map.svg' },
    { id: 'map-marker', name: 'Map Marker', category: 'interface', path: '/Solid/map-marker.svg' },
    { id: 'map-pin', name: 'Map Pin', category: 'interface', path: '/Solid/map-pin.svg' },
    { id: 'menu', name: 'Menu', category: 'interface', path: '/Solid/menu.svg' },
    { id: 'microphone', name: 'Microphone', category: 'media', path: '/Solid/microphone.svg' },
    { id: 'microphone-slash', name: 'Microphone Slash', category: 'media', path: '/Solid/microphone-slash.svg' },
    { id: 'minus-square', name: 'Minus Square', category: 'interface', path: '/Solid/minus-square.svg' },
    { id: 'mobile', name: 'Mobile', category: 'devices', path: '/Solid/mobile.svg' },
    { id: 'more-h-circle', name: 'More H Circle', category: 'interface', path: '/Solid/more-h-circle.svg' },
    { id: 'more-v-circle', name: 'More V Circle', category: 'interface', path: '/Solid/more-v-circle.svg' },
    { id: 'package', name: 'Package', category: 'interface', path: '/Solid/package.svg' },
    { id: 'paperclip', name: 'Paperclip', category: 'interface', path: '/Solid/paperclip.svg' },
    { id: 'pen', name: 'Pen', category: 'interface', path: '/Solid/pen.svg' },
    { id: 'phone', name: 'Phone', category: 'devices', path: '/Solid/phone.svg' },
    { id: 'plus-square', name: 'Plus Square', category: 'interface', path: '/Solid/plus-square.svg' },
    { id: 'question-circle', name: 'Question Circle', category: 'interface', path: '/Solid/question-circle.svg' },
    { id: 'search', name: 'Search', category: 'interface', path: '/Solid/search.svg' },
    { id: 'send', name: 'Send', category: 'communication', path: '/Solid/send.svg' },
    { id: 'settings', name: 'Settings', category: 'interface', path: '/Solid/settings.svg' },
    { id: 'shield', name: 'Shield', category: 'interface', path: '/Solid/shield.svg' },
    { id: 'shopping-basket', name: 'Shopping Basket', category: 'interface', path: '/Solid/shopping-basket.svg' },
    { id: 'sliders-h', name: 'Sliders H', category: 'interface', path: '/Solid/sliders-h.svg' },
    { id: 'sort-ascending', name: 'Sort Ascending', category: 'interface', path: '/Solid/sort-ascending.svg' },
    { id: 'sort-descending', name: 'Sort Descending', category: 'interface', path: '/Solid/sort-descending.svg' },
    { id: 'star', name: 'Star', category: 'interface', path: '/Solid/star.svg' },
    { id: 'stopwatch', name: 'Stopwatch', category: 'interface', path: '/Solid/stopwatch.svg' },
    { id: 'store', name: 'Store', category: 'interface', path: '/Solid/store.svg' },
    { id: 'tablet', name: 'Tablet', category: 'devices', path: '/Solid/tablet.svg' },
    { id: 'tag', name: 'Tag', category: 'interface', path: '/Solid/tag.svg' },
    { id: 'thumbtack', name: 'Thumbtack', category: 'interface', path: '/Solid/thumbtack.svg' },
    { id: 'times-square', name: 'Times Square', category: 'interface', path: '/Solid/times-square.svg' },
    { id: 'trash', name: 'Trash', category: 'interface', path: '/Solid/trash.svg' },
    { id: 'unlock', name: 'Unlock', category: 'interface', path: '/Solid/unlock.svg' },
    { id: 'upload', name: 'Upload', category: 'interface', path: '/Solid/upload.svg' },
    { id: 'user', name: 'User', category: 'interface', path: '/Solid/user.svg' },
    { id: 'users', name: 'Users', category: 'interface', path: '/Solid/users.svg' },
    { id: 'users-three', name: 'Users Three', category: 'interface', path: '/Solid/users-three.svg' },
    { id: 'video', name: 'Video', category: 'media', path: '/Solid/video.svg' },
    { id: 'video-slash', name: 'Video Slash', category: 'media', path: '/Solid/video-slash.svg' },
    { id: 'volume-up', name: 'Volume Up', category: 'media', path: '/Solid/volume-up.svg' }
];

// Mock data for Bold icon variants
const boldIcons = [
    { id: 'arrow-down-bold', name: 'Arrow Down', category: 'interface', path: '/Bold/arrow-down.svg' },
    { id: 'arrow-down-1-bold', name: 'Arrow Down Alt', category: 'interface', path: '/Bold/arrow-down (1).svg' },
    { id: 'arrow-left-bold', name: 'Arrow Left', category: 'interface', path: '/Bold/arrow-left.svg' },
    { id: 'arrow-left-1-bold', name: 'Arrow Left Alt', category: 'interface', path: '/Bold/arrow-left (1).svg' },
    { id: 'arrow-right-bold', name: 'Arrow Right', category: 'interface', path: '/Bold/arrow-right.svg' },
    { id: 'arrow-right-1-bold', name: 'Arrow Right Alt', category: 'interface', path: '/Bold/arrow-right (1).svg' },
    { id: 'arrow-up-bold', name: 'Arrow Up', category: 'interface', path: '/Bold/arrow-up.svg' },
    { id: 'arrow-up-1-bold', name: 'Arrow Up Alt', category: 'interface', path: '/Bold/arrow-up (1).svg' },
    { id: 'bell-bold', name: 'Bell', category: 'communication', path: '/Bold/bell.svg' },
    { id: 'bell-1-bold', name: 'Bell Alt', category: 'communication', path: '/Bold/bell (1).svg' },
    { id: 'bell-slash-bold', name: 'Bell Slash', category: 'communication', path: '/Bold/bell-slash.svg' },
    { id: 'bell-slash-1-bold', name: 'Bell Slash Alt', category: 'communication', path: '/Bold/bell-slash (1).svg' },
    { id: 'bookmark-bold', name: 'Bookmark', category: 'interface', path: '/Bold/bookmark.svg' },
    { id: 'bookmark-1-bold', name: 'Bookmark Alt', category: 'interface', path: '/Bold/bookmark (1).svg' },
    { id: 'calendar-bold', name: 'Calendar', category: 'interface', path: '/Bold/calendar.svg' },
    { id: 'calendar-1-bold', name: 'Calendar Alt', category: 'interface', path: '/Bold/calendar (1).svg' },
    { id: 'camera-bold', name: 'Camera', category: 'media', path: '/Bold/camera.svg' },
    { id: 'camera-1-bold', name: 'Camera Alt', category: 'media', path: '/Bold/camera (1).svg' },
    { id: 'chart-pie-bold', name: 'Chart Pie', category: 'interface', path: '/Bold/chart-pie.svg' },
    { id: 'chart-pie-1-bold', name: 'Chart Pie Alt', category: 'interface', path: '/Bold/chart-pie (1).svg' },
    { id: 'check-circle-bold', name: 'Check Circle', category: 'interface', path: '/Bold/check-circle.svg' },
    { id: 'check-circle-1-bold', name: 'Check Circle Alt', category: 'interface', path: '/Bold/check-circle (1).svg' },
    { id: 'chevron-circle-down-bold', name: 'Chevron Circle Down', category: 'interface', path: '/Bold/chevron-circle-down.svg' },
    { id: 'chevron-circle-down-1-bold', name: 'Chevron Circle Down Alt', category: 'interface', path: '/Bold/chevron-circle-down (1).svg' },
    { id: 'chevron-circle-left-bold', name: 'Chevron Circle Left', category: 'interface', path: '/Bold/chevron-circle-left.svg' },
    { id: 'chevron-circle-left-1-bold', name: 'Chevron Circle Left Alt', category: 'interface', path: '/Bold/chevron-circle-left (1).svg' },
    { id: 'chevron-circle-right-bold', name: 'Chevron Circle Right', category: 'interface', path: '/Bold/chevron-circle-right.svg' },
    { id: 'chevron-circle-right-1-bold', name: 'Chevron Circle Right Alt', category: 'interface', path: '/Bold/chevron-circle-right (1).svg' },
    { id: 'chevron-circle-up-bold', name: 'Chevron Circle Up', category: 'interface', path: '/Bold/chevron-circle-up.svg' },
    { id: 'chevron-circle-up-1-bold', name: 'Chevron Circle Up Alt', category: 'interface', path: '/Bold/chevron-circle-up (1).svg' },
    { id: 'chevron-down-bold', name: 'Chevron Down', category: 'interface', path: '/Bold/chevron-down.svg' },
    { id: 'chevron-down-1-bold', name: 'Chevron Down Alt', category: 'interface', path: '/Bold/chevron-down (1).svg' },
    { id: 'chevron-left-bold', name: 'Chevron Left', category: 'interface', path: '/Bold/chevron-left.svg' },
    { id: 'chevron-left-1-bold', name: 'Chevron Left Alt', category: 'interface', path: '/Bold/chevron-left (1).svg' },
    { id: 'chevron-right-bold', name: 'Chevron Right', category: 'interface', path: '/Bold/chevron-right.svg' },
    { id: 'chevron-right-1-bold', name: 'Chevron Right Alt', category: 'interface', path: '/Bold/chevron-right (1).svg' },
    { id: 'chevron-up-bold', name: 'Chevron Up', category: 'interface', path: '/Bold/chevron-up.svg' },
    { id: 'clock-bold', name: 'Clock', category: 'interface', path: '/Bold/clock.svg' },
    { id: 'comment-bold', name: 'Comment', category: 'communication', path: '/Bold/comment.svg' },
    { id: 'comment-dots-bold', name: 'Comment Dots', category: 'communication', path: '/Bold/comment-dots.svg' },
    { id: 'comments-bold', name: 'Comments', category: 'communication', path: '/Bold/comments.svg' },
    { id: 'compass-bold', name: 'Compass', category: 'interface', path: '/Bold/compass.svg' },
    { id: 'copy-bold', name: 'Copy', category: 'interface', path: '/Bold/copy.svg' },
    { id: 'coupon-bold', name: 'Coupon', category: 'interface', path: '/Bold/coupon.svg' },
    { id: 'credit-card-bold', name: 'Credit Card', category: 'interface', path: '/Bold/credit-card.svg' },
    { id: 'desktop-bold', name: 'Desktop', category: 'devices', path: '/Bold/desktop.svg' },
    { id: 'discount-bold', name: 'Discount', category: 'interface', path: '/Bold/discount.svg' },
    { id: 'download-bold', name: 'Download', category: 'interface', path: '/Bold/download.svg' },
    { id: 'envelope-bold', name: 'Envelope', category: 'communication', path: '/Bold/envelope.svg' },
    { id: 'exclamation-circle-bold', name: 'Exclamation Circle', category: 'interface', path: '/Bold/exclamation-circle.svg' },
    { id: 'eye-bold', name: 'Eye', category: 'interface', path: '/Bold/eye.svg' },
    { id: 'eye-slash-bold', name: 'Eye Slash', category: 'interface', path: '/Bold/eye-slash.svg' },
    { id: 'file-bold', name: 'File', category: 'interface', path: '/Bold/file.svg' },
    { id: 'film-bold', name: 'Film', category: 'media', path: '/Bold/film.svg' },
    { id: 'filter-bold', name: 'Filter', category: 'interface', path: '/Bold/filter.svg' },
    { id: 'flag-bold', name: 'Flag', category: 'interface', path: '/Bold/flag.svg' },
    { id: 'folder-bold', name: 'Folder', category: 'interface', path: '/Bold/folder.svg' },
    { id: 'globe-bold', name: 'Globe', category: 'interface', path: '/Bold/globe.svg' },
    { id: 'headphones-bold', name: 'Headphones', category: 'devices', path: '/Bold/headphones.svg' },
    { id: 'heart-bold', name: 'Heart', category: 'interface', path: '/Bold/heart.svg' },
    { id: 'home-bold', name: 'Home', category: 'interface', path: '/Bold/home.svg' },
    { id: 'image-bold', name: 'Image', category: 'media', path: '/Bold/image.svg' },
    { id: 'inbox-bold', name: 'Inbox', category: 'communication', path: '/Bold/inbox.svg' },
    { id: 'info-circle-bold', name: 'Info Circle', category: 'interface', path: '/Bold/info-circle.svg' },
    { id: 'link-bold', name: 'Link', category: 'interface', path: '/Bold/link.svg' },
    { id: 'lock-bold', name: 'Lock', category: 'interface', path: '/Bold/lock.svg' },
    { id: 'log-in-bold', name: 'Log In', category: 'interface', path: '/Bold/log-in.svg' },
    { id: 'log-out-bold', name: 'Log Out', category: 'interface', path: '/Bold/log-out.svg' },
    { id: 'map-bold', name: 'Map', category: 'interface', path: '/Bold/map.svg' },
    { id: 'map-marker-bold', name: 'Map Marker', category: 'interface', path: '/Bold/map-marker.svg' },
    { id: 'map-pin-bold', name: 'Map Pin', category: 'interface', path: '/Bold/map-pin.svg' },
    { id: 'menu-bold', name: 'Menu', category: 'interface', path: '/Bold/menu.svg' },
    { id: 'microphone-bold', name: 'Microphone', category: 'media', path: '/Bold/microphone.svg' },
    { id: 'microphone-slash-bold', name: 'Microphone Slash', category: 'media', path: '/Bold/microphone-slash.svg' },
    { id: 'minus-square-bold', name: 'Minus Square', category: 'interface', path: '/Bold/minus-square.svg' },
    { id: 'mobile-bold', name: 'Mobile', category: 'devices', path: '/Bold/mobile.svg' },
    { id: 'more-h-circle-bold', name: 'More H Circle', category: 'interface', path: '/Bold/more-h-circle.svg' },
    { id: 'more-v-circle-bold', name: 'More V Circle', category: 'interface', path: '/Bold/more-v-circle.svg' },
    { id: 'package-bold', name: 'Package', category: 'interface', path: '/Bold/package.svg' },
    { id: 'paperclip-bold', name: 'Paperclip', category: 'interface', path: '/Bold/paperclip.svg' },
    { id: 'pen-bold', name: 'Pen', category: 'interface', path: '/Bold/pen.svg' },
    { id: 'phone-bold', name: 'Phone', category: 'devices', path: '/Bold/phone.svg' },
    { id: 'plus-square-bold', name: 'Plus Square', category: 'interface', path: '/Bold/plus-square.svg' },
    { id: 'question-circle-bold', name: 'Question Circle', category: 'interface', path: '/Bold/question-circle.svg' },
    { id: 'search-bold', name: 'Search', category: 'interface', path: '/Bold/search.svg' },
    { id: 'send-bold', name: 'Send', category: 'communication', path: '/Bold/send.svg' },
    { id: 'settings-bold', name: 'Settings', category: 'interface', path: '/Bold/settings.svg' },
    { id: 'shield-bold', name: 'Shield', category: 'interface', path: '/Bold/shield.svg' },
    { id: 'shopping-basket-bold', name: 'Shopping Basket', category: 'interface', path: '/Bold/shopping-basket.svg' },
    { id: 'sliders-h-bold', name: 'Sliders H', category: 'interface', path: '/Bold/sliders-h.svg' },
    { id: 'sort-ascending-bold', name: 'Sort Ascending', category: 'interface', path: '/Bold/sort-ascending.svg' },
    { id: 'sort-descending-bold', name: 'Sort Descending', category: 'interface', path: '/Bold/sort-descending.svg' },
    { id: 'star-bold', name: 'Star', category: 'interface', path: '/Bold/star.svg' },
    { id: 'stopwatch-bold', name: 'Stopwatch', category: 'interface', path: '/Bold/stopwatch.svg' },
    { id: 'store-bold', name: 'Store', category: 'interface', path: '/Bold/store.svg' },
    { id: 'tablet-bold', name: 'Tablet', category: 'devices', path: '/Bold/tablet.svg' },
    { id: 'tag-bold', name: 'Tag', category: 'interface', path: '/Bold/tag.svg' },
    { id: 'thumbtack-bold', name: 'Thumbtack', category: 'interface', path: '/Bold/thumbtack.svg' },
    { id: 'times-square-bold', name: 'Times Square', category: 'interface', path: '/Bold/times-square.svg' },
    { id: 'trash-bold', name: 'Trash', category: 'interface', path: '/Bold/trash.svg' },
    { id: 'unlock-bold', name: 'Unlock', category: 'interface', path: '/Bold/unlock.svg' },
    { id: 'upload-bold', name: 'Upload', category: 'interface', path: '/Bold/upload.svg' },
    { id: 'user-bold', name: 'User', category: 'interface', path: '/Bold/user.svg' },
    { id: 'users-bold', name: 'Users', category: 'interface', path: '/Bold/users.svg' },
    { id: 'users-three-bold', name: 'Users Three', category: 'interface', path: '/Bold/users-three.svg' },
    { id: 'video-bold', name: 'Video', category: 'media', path: '/Bold/video.svg' },
    { id: 'video-slash-bold', name: 'Video Slash', category: 'media', path: '/Bold/video-slash.svg' },
    { id: 'volume-up-bold', name: 'Volume Up', category: 'media', path: '/Bold/volume-up.svg' }
];

// Current active icon set (default is solid)
let currentIconSet = icons;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons grid
    populateIcons();
    
    // Initialize custom cursor
    initCursor();
    
    // Initialize animations
    initAnimations();
    
    // Initialize tabs
    initTabs();
    
    // Initialize clipboard.js
    initClipboard();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize particles
    initParticles();
});

function initStyleToggle() {
    const styleToggle = document.getElementById('style-toggle');
    const styleLabels = document.querySelectorAll('.style-label');
    
    if (!styleToggle) return; // Add null check
    
    styleToggle.addEventListener('change', function() {
        // Update active label
        styleLabels.forEach(label => {
            label.classList.toggle('active');
        });
        
        // Switch between solid and bold icons
        if (this.checked) {
            // Bold icons
            currentIconSet = boldIcons;
        } else {
            // Solid icons
            currentIconSet = icons;
        }
        
        // Clear and repopulate the icons grid
        const iconsGrid = document.getElementById('icons-grid');
        if (iconsGrid) {
            iconsGrid.innerHTML = '';
            populateIcons();
        }
    });
}

function populateIcons() {
    const iconsGrid = document.getElementById('icons-grid');
    if (!iconsGrid) return; // Exit if not on a page with icons grid
    
    // Clear the grid before populating to avoid duplicates
    iconsGrid.innerHTML = '';
    
    currentIconSet.forEach(icon => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        iconElement.dataset.category = icon.category;
        iconElement.dataset.id = icon.id;
        
        // Create an img element to load the SVG
        const img = document.createElement('img');
        img.src = icon.path;
        img.alt = icon.name;
        img.className = 'icon-svg';
        img.onerror = function() {
            // Handle broken image by replacing with a placeholder or indicator
            this.src = '/Solid/image.svg'; // Using an available image icon as fallback
            iconElement.classList.add('broken-icon');
        };
        
        // Create the name span
        const nameSpan = document.createElement('span');
        nameSpan.className = 'icon-name';
        nameSpan.textContent = icon.name;
        
        // Append children
        iconElement.appendChild(img);
        iconElement.appendChild(nameSpan);
        
        iconElement.addEventListener('click', () => {
            showIconModal(icon);
        });
        
        iconsGrid.appendChild(iconElement);
    });
}

function showIconModal(icon) {
    const modal = document.getElementById('icon-modal');
    const modalName = document.getElementById('modal-icon-name');
    const modalIcon = document.getElementById('modal-icon-svg');
    
    if (!modal || !modalName || !modalIcon) return;
    
    modalName.textContent = icon.name;
    
    // Create an img element for the modal
    modalIcon.innerHTML = '';
    const img = document.createElement('img');
    img.src = icon.path;
    img.alt = icon.name;
    img.className = 'modal-icon-image';
    modalIcon.appendChild(img);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Add animation for the modal icon
    setTimeout(() => {
        img.style.transform = 'scale(1.1)';
        setTimeout(() => {
            img.style.transform = '';
        }, 300);
    }, 300);
}

function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
    });
    
    const interactiveElements = document.querySelectorAll('a, button, .icon-item, input, .style-toggle-label');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });
}

function initAnimations() {
    // Scroll reveal animation with IntersectionObserver
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const elements = document.querySelectorAll('section h2, .feature-card, .icon-item, .hero-content h1, .hero-content p, .hero-buttons, .library-controls, .modal-content, .footer-column');
    elements.forEach((el, index) => {
        // Add staggered delay for smoother animations
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });

    // Enhanced header scroll effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
                header.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.15)';
            } else {
                header.classList.remove('scrolled');
                header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.05)';
            }
        });
    }
    
    // Enhanced icon animations on hover
    const iconContainers = document.querySelectorAll('.icon-container');
    iconContainers.forEach(container => {
        container.addEventListener('mouseenter', () => {
            const icon = container.querySelector('img');
            icon.style.filter = 'var(--icon-filter-accent) drop-shadow(0 5px 10px rgba(99, 102, 241, 0.3))';
            icon.style.transform = 'scale(1.4) rotate(10deg)';
        });
        
        container.addEventListener('mouseleave', () => {
            const icon = container.querySelector('img');
            icon.style.filter = '';
            icon.style.transform = '';
        });
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.dataset.tab;
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

function initClipboard() {
    const clipboard = new ClipboardJS('.copy-button');
    
    clipboard.on('success', function(e) {
        showToast('Copied to clipboard!');
        e.clearSelection();
    });
    
    const iconCopyButtons = {
        'copy-svg': (icon) => {
            // Fetch the SVG content from the file
            return fetch(icon.path)
                .then(response => response.text())
                .then(svgContent => svgContent);
        },
        'copy-component': (icon) => {
            return `<Lume${icon.name} />`;
        }
    };
    
    for (const [id, getContent] of Object.entries(iconCopyButtons)) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', () => {
                const modalIconName = document.getElementById('modal-icon-name').textContent;
                const icon = currentIconSet.find(i => i.name === modalIconName);
                
                if (icon) {
                    getContent(icon)
                        .then(content => {
                            navigator.clipboard.writeText(content)
                                .then(() => showToast('Copied to clipboard!'))
                                .catch(err => showToast('Failed to copy', true));
                        })
                        .catch(err => showToast('Failed to get content', true));
                }
            });
        }
    }
    
    // Download SVG
    const downloadButton = document.getElementById('download-svg');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            const iconName = document.getElementById('modal-icon-name').textContent;
            const icon = currentIconSet.find(i => i.name === iconName);
            
            if (icon) {
                fetch(icon.path)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `lume-${iconName.toLowerCase()}.svg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        
                        showToast('Icon downloaded!');
                    })
                    .catch(err => showToast('Failed to download', true));
            }
        });
    }
}

function initEventListeners() {
    // Close modal - add null checks
    const closeModalButton = document.getElementById('close-modal');
    const iconModal = document.getElementById('icon-modal');
    
    if (closeModalButton && iconModal) {
        closeModalButton.addEventListener('click', () => {
            iconModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
        
        // Click outside modal to close
        iconModal.addEventListener('click', (e) => {
            if (e.target === iconModal) {
                iconModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Icon search
    const searchInput = document.getElementById('icon-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            filterIcons(searchTerm);
        });
    }
    
    // Category filters
    const filterButtons = document.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const category = button.dataset.category;
            filterIconsByCategory(category);
        });
    });
    
    // Initialize style toggle if we're on the library page
    if (document.querySelector('.style-toggle-checkbox')) {
        initStyleToggle();
    }
    
    // Smooth scroll for navigation
    document.querySelectorAll('header nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function filterIcons(searchTerm) {
    const iconItems = document.querySelectorAll('.icon-item');
    
    iconItems.forEach(item => {
        const iconName = item.querySelector('.icon-name').textContent.toLowerCase();
        if (iconName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterIconsByCategory(category) {
    const iconItems = document.querySelectorAll('.icon-item');
    
    iconItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function showToast(message, isError = false) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast${isError ? ' error' : ''}`;
    toast.innerHTML = `
        <svg viewBox="0 0 24 24">
            ${isError 
                ? '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>'
                : '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>'
            }
        </svg>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate the toast
    setTimeout(() => {
        toast.classList.add('active');
    }, 10);
    
    // Remove the toast after a delay
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Create particles
    const particleCount = window.innerWidth < 768 ? 40 : 70;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container, i);
    }
}

function createParticle(container, index) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Enhanced random properties
    const size = Math.random() * 15 + 5;
    const opacity = Math.random() * 0.6 + 0.2;
    const duration = Math.random() * 8 + 4;
    const delay = Math.random() * 2;
    
    // Enhanced random start and end positions
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    const endX = startX + (Math.random() * 300 - 150);
    const endY = startY + (Math.random() * 300 - 400);
    
    // Apply enhanced styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = index % 3 === 0 ? 'var(--particle-color)' : 
                                    index % 3 === 1 ? 'var(--particle-color-alt)' : 
                                    'rgba(255, 255, 255, 0.3)';
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.setProperty('--opacity', opacity.toString());
    particle.style.setProperty('--duration', `${duration}s`);
    particle.style.setProperty('--delay', `${delay}s`);
    particle.style.setProperty('--x-start', '0px');
    particle.style.setProperty('--y-start', '0px');
    particle.style.setProperty('--x-end', `${endX - startX}px`);
    particle.style.setProperty('--y-end', `${endY - startY}px`);
    
    // Enhanced box-shadow for better glow effect
    particle.style.boxShadow = `0 0 ${size * 3}px ${index % 3 === 0 ? 'var(--particle-color)' : 'var(--particle-color-alt)'}`;
    
    // Append to container
    container.appendChild(particle);
    
    // Remove and recreate particle after animation completes
    setTimeout(() => {
        particle.remove();
        createParticle(container, index);
    }, (duration + delay) * 1000);
}