class CloseBanner {
    constructor() {
        this.banner = document.getElementById('closeBanner');
        this.closeBtn = document.getElementById('closeBtn');
        this.storageKey = 'bannerClosed';
        this.expiryDays = 1; // Banner will stay closed for 1 day
        
        this.init();
    }

    init() {
        // Check if banner was previously closed
        if (this.isBannerClosed()) {
            this.hideBanner();
            return;
        }

        // Add event listeners
        this.closeBtn.addEventListener('click', () => this.closeBanner());
        
        // Optional: Auto-close after some time
        this.setAutoClose();
    }

    closeBanner() {
        this.hideBanner();
        this.setBannerClosed();
    }

    hideBanner() {
        this.banner.classList.add('hidden');
    }

    showBanner() {
        this.banner.classList.remove('hidden');
    }

    setBannerClosed() {
        const now = new Date();
        const expiryDate = new Date(now.getTime() + (this.expiryDays * 24 * 60 * 60 * 1000));
        
        const bannerState = {
            closed: true,
            expiry: expiryDate.getTime()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(bannerState));
    }

    isBannerClosed() {
        const bannerState = localStorage.getItem(this.storageKey);
        
        if (!bannerState) return false;
        
        try {
            const state = JSON.parse(bannerState);
            const now = new Date().getTime();
            
            // Check if expiry date has passed
            if (now > state.expiry) {
                localStorage.removeItem(this.storageKey);
                return false;
            }
            
            return state.closed;
        } catch (error) {
            console.error('Error reading banner state:', error);
            return false;
        }
    }

    setAutoClose() {
        // Auto-close after 10 seconds (optional)
        setTimeout(() => {
            if (!this.isBannerClosed()) {
                this.closeBanner();
            }
        }, 10000);
    }

    // Method to reset banner (for testing purposes)
    resetBanner() {
        localStorage.removeItem(this.storageKey);
        this.showBanner();
    }
}

// Initialize the banner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CloseBanner();
});

// Optional: Expose reset method for testing in console
window.resetBanner = function() {
    const banner = new CloseBanner();
    banner.resetBanner();
};
