// Store current platform being connected/disconnected
let currentPlatform = null;

// Platform configuration
const platformConfig = {
    facebook: {
        name: 'Facebook',
        icon: 'fab fa-facebook-f',
        color: '#1976d2',
        bannerBg: 'linear-gradient(135deg, #e3f2fd, #bbdefb)'
    },
    instagram: {
        name: 'Instagram',
        icon: 'fab fa-instagram',
        color: '#c2185b',
        bannerBg: 'linear-gradient(135deg, #fce4ec, #f8bbd9)'
    },
    x: {
        name: 'X',
        icon: 'fab fa-x-twitter',
        color: '#ffffff',
        bannerBg: '#424242'
    },
    tiktok: {
        name: 'TikTok',
        icon: 'fab fa-tiktok',
        color: '#ffffff',
        bannerBg: '#212121'
    },
    pinterest: {
        name: 'Pinterest',
        icon: 'fab fa-pinterest-p',
        color: '#c62828',
        bannerBg: '#ffebee'
    },
    youtube: {
        name: 'YouTube Shorts',
        icon: 'fab fa-youtube',
        color: '#c62828',
        bannerBg: '#ffebee'
    }
};

// Show Connect Modal
function showConnectModal(platform) {
    currentPlatform = platform;
    const modal = document.getElementById('connectModal');
    const config = platformConfig[platform];
    
    // Update modal content
    document.getElementById('connectModalIcon').innerHTML = `<i class="${config.icon}"></i>`;
    document.getElementById('connectModalIcon').style.background = config.bannerBg;
    document.getElementById('connectModalIcon').style.color = config.color;
    document.getElementById('connectModalSubtitle').textContent = 
        `Have a ${config.name} account? Log in to easily switch between them`;
    
    // Update signup link based on platform
    const platformName = platform === 'x' ? 'X' : config.name;
    document.getElementById('signupLink').innerHTML = 
        `Not on ${platformName} yet? <a href="#">Sign up</a>`;
    
    modal.classList.add('active');
}

// Show Disconnect Modal
function showDisconnectModal(platform) {
    currentPlatform = platform;
    const modal = document.getElementById('disconnectModal');
    const card = document.querySelector(`[data-platform="${platform}"]`);
    const username = card.getAttribute('data-username');
    
    document.getElementById('disconnectUsername').textContent = username;
    document.getElementById('confirmDisconnect').checked = false;
    
    modal.classList.add('active');
}

// Close Modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    currentPlatform = null;
}

// Handle Connect Form Submit
function handleConnect(event) {
    event.preventDefault();
    
    if (currentPlatform) {
        const config = platformConfig[currentPlatform];
        const card = document.querySelector(`[data-platform="${currentPlatform}"]`);
        
        // Generate mock username and date
        const mockUsername = `${currentPlatform}_user_${Math.floor(Math.random() * 1000)}`;
        const today = new Date();
        const connectedDate = today.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Update card data
        card.setAttribute('data-connected', 'true');
        card.setAttribute('data-username', mockUsername);
        card.setAttribute('data-date', connectedDate);
        
        // Update card content
        card.querySelector('.card-body').innerHTML = `
            <div class="info-row">
                <span class="label">Username</span>
                <span class="value username-display">${mockUsername}</span>
            </div>
            <div class="info-row">
                <span class="label">Connected</span>
                <span class="value date-display">${connectedDate}</span>
            </div>
        `;
        
        // Update status indicator
        const statusIndicator = card.querySelector('.status-indicator');
        statusIndicator.classList.remove('inactive');
        statusIndicator.classList.add('active');
        
        // Change button to disconnect
        const button = card.querySelector('.btn');
        button.className = 'btn disconnect-btn';
        button.innerHTML = '<i class="fas fa-unlink"></i> Disconnect';
        button.setAttribute('onclick', `showDisconnectModal('${currentPlatform}')`);
        
        // Close modal
        closeModal('connectModal');
        
        // Show success message
        showNotification(`Successfully connected to ${config.name}!`, 'success');
    }
}

// Confirm Disconnect
function confirmDisconnect() {
    const checkbox = document.getElementById('confirmDisconnect');
    
    if (!checkbox.checked) {
        alert('Please confirm that you want to disconnect this account.');
        return;
    }
    
    if (currentPlatform) {
        const config = platformConfig[currentPlatform];
        const card = document.querySelector(`[data-platform="${currentPlatform}"]`);
        
        // Update card to disconnected state
        card.setAttribute('data-connected', 'false');
        card.removeAttribute('data-username');
        card.removeAttribute('data-date');
        
        // Update card content
        card.querySelector('.card-body').innerHTML = '<p>No account connected</p>';
        card.querySelector('.card-body').classList.add('empty-state');
        
        // Update status indicator
        const statusIndicator = card.querySelector('.status-indicator');
        statusIndicator.classList.remove('active');
        statusIndicator.classList.add('inactive');
        
        // Change button to connect
        const button = card.querySelector('.btn');
        button.className = 'btn connect-btn';
        button.innerHTML = 'Connect Account';
        button.setAttribute('onclick', `showConnectModal('${currentPlatform}')`);
        
        // Close modal
        closeModal('disconnectModal');
        
        // Show success message
        showNotification(`Successfully disconnected from ${config.name}`, 'success');
    }
}

// Toggle Password Visibility
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-password')) {
        const input = e.target.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            e.target.classList.remove('fa-eye');
            e.target.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            e.target.classList.remove('fa-eye-slash');
            e.target.classList.add('fa-eye');
        }
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        currentPlatform = null;
    }
});

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('Connected Accounts page loaded successfully');