
// NowPayments API Integration
// Credentials are now stored securely in config.php

class PaymentAPI {
    constructor(credentials) {
        this.apiKey = credentials.apiKey;
        this.email = credentials.email;
        this.password = credentials.password;
        this.baseUrl = credentials.apiUrl;
        this.jwtToken = null;
    }

    async makeRequest(endpoint, method = 'GET', body = null, useJWT = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        // For payout requests, use both JWT and API key
        if (useJWT) {
            if (!this.jwtToken) {
                console.log('No JWT token found, authenticating...');
                await this.authenticate();
            }
            headers['Authorization'] = `Bearer ${this.jwtToken}`;
            headers['x-api-key'] = this.apiKey; // Payout also needs API key
        } else {
            headers['x-api-key'] = this.apiKey;
        }

        const options = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        console.log(`Making ${method} request to ${endpoint}`, { useJWT, hasToken: !!this.jwtToken });

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            const data = await response.json();

            if (!response.ok) {
                console.error(`API Error (${response.status}):`, data);

                // If JWT token expired or invalid, re-authenticate and retry (only once)
                if (useJWT && (response.status === 401 || response.status === 403) && !options.isRetry) {
                    console.log('Token invalid, re-authenticating...');
                    this.jwtToken = null;
                    await this.authenticate();
                    headers['Authorization'] = `Bearer ${this.jwtToken}`;
                    headers['x-api-key'] = this.apiKey; // Ensure API key is included
                    options.headers = headers;
                    options.isRetry = true; // Prevent infinite retry loop

                    const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, options);
                    const retryData = await retryResponse.json();

                    if (!retryResponse.ok) {
                        console.error('Retry failed:', retryData);
                        // Provide specific error message for payout issues
                        if (endpoint === '/payout' && retryResponse.status === 403) {
                            throw new Error('Payout functionality not enabled. Please contact NowPayments support to enable payout permissions for your account.');
                        }
                        throw new Error(retryData.message || `Payment request failed: ${retryResponse.status}`);
                    }

                    return retryData;
                }

                // Specific error for payout permission issues
                if (endpoint === '/payout' && response.status === 403) {
                    throw new Error('Payout functionality not enabled. Contact NowPayments support to enable payout permissions.');
                }

                throw new Error(data.message || `Payment request failed: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Payment API Error:', error);
            throw error;
        }
    }

    // Authenticate and get JWT token
    async authenticate() {
        try {
            const response = await fetch(`${this.baseUrl}/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Authentication failed:', data);
                throw new Error(data.message || `Authentication failed: ${response.status}`);
            }

            this.jwtToken = data.token;
            console.log('JWT authentication successful');
            return this.jwtToken;
        } catch (error) {
            console.error('Authentication Error:', error);
            throw error;
        }
    }

    // Get available currencies
    async getAvailableCurrencies() {
        return await this.makeRequest('/currencies');
    }

    // Get minimum payment amount
    async getMinimumAmount(currency = 'usdtbsc') {
        return await this.makeRequest(`/min-amount?currency_from=usd&currency_to=${currency}`);
    }

    // Create payment for tier upgrade
    async createTierPayment(tierPrice, userId, tierId) {
        const paymentData = {
            price_amount: tierPrice,
            price_currency: 'usd',
            pay_currency: 'usdtbsc', // USDT BEP20
            ipn_callback_url: `${window.location.origin}/payment-callback`,
            order_id: `PImining_${tierId}`,
            order_description: `Tier Upgrade to ${tierId}`
        };

        return await this.makeRequest('/payment', 'POST', paymentData);
    }

    // Create payout for withdrawal
    async createWithdrawal(amount, walletAddress, userId) {
        const payoutData = {
            withdrawals: [
                {
                    address: walletAddress,
                    currency: 'usdtmatic',
                    amount: parseFloat(amount),
                    ipn_callback_url: `${window.location.origin}/withdrawal-callback`,
                    unique_external_id: `withdrawal_${userId}_${Date.now()}`
                }
            ]
        };

        return await this.makeRequest('/payout', 'POST', payoutData, true); // true = use JWT
    }

    // Check payment status
    async getPaymentStatus(paymentId) {
        return await this.makeRequest(`/payment/${paymentId}`);
    }

    // Check withdrawal/payout status
    async getWithdrawalStatus(batchPayoutId) {
        // NowPayments uses batch_payout_id to check status
        if (!batchPayoutId) {
            throw new Error('Batch payout ID is required to check withdrawal status');
        }
        // Use batch_payout_id as path parameter, not query parameter
        return await this.makeRequest(`/payout/${batchPayoutId}`, 'GET', null, true);
    }

    // Estimate exchange rate
    async estimatePrice(amount, currencyFrom = 'usd', currencyTo = 'usdtbsc') {
        return await this.makeRequest(`/estimate?amount=${amount}&currency_from=${currencyFrom}&currency_to=${currencyTo}`);
    }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PaymentAPI;
}
