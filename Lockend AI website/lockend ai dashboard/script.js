// Sample data for the charts
const generateData = (days, baseValue, variance) => {
    const data = [];
    const labels = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const randomVariance = (Math.random() - 0.5) * variance;
        data.push(Math.round(baseValue + randomVariance));
    }
    
    return { labels, data };
};

// Chart instances
let messagesChart = null;
let appointmentsChart = null;

// Data processing functions
function processWebhookData(data) {
    console.log('Processing data:', data);
    
    // Find unique sessions with a booking
    const sessionsWithBooking = new Set();
    const allSessions = new Set();
    const messagesByDay = {};
    const bookingsByDay = {};

    // Process each message
    data.forEach(msg => {
        console.log('Processing message:', msg);
        
        // Add to session tracking
        allSessions.add(msg["Session ID"]);
        if (msg["Appointment Booked"] === true) {  // Explicit comparison
            sessionsWithBooking.add(msg["Session ID"]);
        }
        
        // Add to daily counts
        const day = msg.Timestamp.split('-').slice(0, 3).join('-');
        messagesByDay[day] = (messagesByDay[day] || 0) + 1;
        if (msg["Appointment Booked"] === true) {  // Explicit comparison
            bookingsByDay[day] = (bookingsByDay[day] || 0) + 1;
        }
    });

    const metrics = {
        totalMessages: data.length,
        appointmentsBooked: sessionsWithBooking.size,
        messagesPerBooking: sessionsWithBooking.size > 0 ? Math.round(data.length / sessionsWithBooking.size) : 0
    };

    console.log('Calculated metrics:', metrics);
    console.log('Messages by day:', messagesByDay);
    console.log('Bookings by day:', bookingsByDay);

    return {
        metrics,
        messagesByDay,
        bookingsByDay
    };
}

// Update last updated timestamp - REMOVED

// Function to generate date labels for the full timeframe
function generateDateLabels(timeframe) {
    const labels = [];
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeframe) {
        case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        default: // 7d
            startDate.setDate(endDate.getDate() - 7);
    }
    
    // Generate all dates between start and end
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        labels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return labels;
}

// Function to process data into daily counts with full timeframe
function processDataForCharts(data, timeframe) {
    const labels = generateDateLabels(timeframe);
    const messageData = new Array(labels.length).fill(0);
    const bookingData = new Array(labels.length).fill(0);
    
    // Create a map of date strings to array indices
    const dateToIndex = {};
    labels.forEach((label, index) => {
        dateToIndex[label] = index;
    });
    
    // Process the data
    data.forEach(item => {
        const date = new Date(item.Timestamp.split('-').slice(0, 3).join('-'));
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (dateToIndex.hasOwnProperty(dateStr)) {
            messageData[dateToIndex[dateStr]]++;
            if (item["Appointment Booked"]) {
                bookingData[dateToIndex[dateStr]]++;
            }
        }
    });
    
    // Convert messageData to cumulative sum
    for (let i = 1; i < messageData.length; i++) {
        messageData[i] += messageData[i - 1];
    }
    
    return {
        labels,
        messageData,
        bookingData
    };
}

// Update dashboard with new data
function updateDashboard(data) {
    const processed = processWebhookData(data);
    console.log('Processed metrics:', processed);
    
    // Get current timeframe
    const activeTimeframe = document.querySelector('.time-btn.active').getAttribute('data-timeframe');
    
    // Process data for charts with full timeframe
    const chartData = processDataForCharts(data, activeTimeframe);
    
    // Update metrics
    document.querySelector('.metric-card:nth-child(1) .metric-value').textContent = 
        processed.metrics.appointmentsBooked.toLocaleString();
    document.querySelector('.metric-card:nth-child(2) .metric-value').textContent = 
        processed.metrics.totalMessages.toLocaleString();
    document.querySelector('.metric-card:nth-child(3) .metric-value').textContent = 
        processed.metrics.messagesPerBooking.toLocaleString();

    // Update charts with full timeframe data
    messagesChart.data.labels = chartData.labels;
    messagesChart.data.datasets[0].data = chartData.messageData;
    const maxMessages = Math.max(...chartData.messageData, 1);
    messagesChart.options.scales.y.suggestedMax = Math.ceil(maxMessages * 1.1);
    messagesChart.update();

    // Appointments chart
    appointmentsChart.data.labels = chartData.labels;
    appointmentsChart.data.datasets[0].data = chartData.bookingData;
    const maxBookings = Math.max(...chartData.bookingData, 1);
    appointmentsChart.options.scales.y.suggestedMax = Math.ceil(maxBookings * 1.1);
    appointmentsChart.update();
}

// Helper to get and set last fetch time
function getLastFetchTime() {
    return parseInt(localStorage.getItem('lastFetchTime') || '0', 10);
}
function setLastFetchTime(ts) {
    localStorage.setItem('lastFetchTime', ts.toString());
}

// Store and load last fetched data
function storeLastData(data) {
    localStorage.setItem('lastDashboardData', JSON.stringify(data));
}
function loadLastData() {
    const raw = localStorage.getItem('lastDashboardData');
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
function clearLastData() {
    localStorage.removeItem('lastDashboardData');
}

// Helper to get the most recent and next half-hour marks
function getMostRecentHalfHourMark(ts = Date.now()) {
    const date = new Date(ts);
    date.setSeconds(0, 0);
    const mins = date.getMinutes();
    if (mins < 30) {
        date.setMinutes(0);
    } else {
        date.setMinutes(30);
    }
    return date.getTime();
}
function getNextHalfHourMark(ts = Date.now()) {
    const date = new Date(getMostRecentHalfHourMark(ts));
    date.setMinutes(date.getMinutes() + 30);
    return date.getTime();
}

// Store and load last updated half-hour mark
function storeLastUpdated(ts) {
    localStorage.setItem('lastDashboardUpdated', ts.toString());
}
function loadLastUpdated() {
    return localStorage.getItem('lastDashboardUpdated');
}

// Update fetchData to store last updated as the most recent half-hour mark
async function fetchData(timeframe = '7d') {
    try {
        const webhookUrl = sessionStorage.getItem('chatbotWebhook');
        if (!webhookUrl || webhookUrl.includes('YOUR_')) {
            console.error('No valid webhook URL found for chatbot. Please log in again.');
            // Here you could optionally display a message to the user
            return;
        }

        // Calculate date range based on timeframe
        const endDate = new Date();
        const startDate = new Date();
        
        switch(timeframe) {
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            default: // 7d
                startDate.setDate(endDate.getDate() - 7);
        }

        // Build URL with query parameters
        const url = new URL(webhookUrl);
        url.searchParams.append('startTime', startDate.toISOString());
        url.searchParams.append('endTime', endDate.toISOString());
        url.searchParams.append('limit', '1000');  // Increased limit for longer timeframes
        url.searchParams.append('batch', 'true');
        
        console.log('Fetching data from:', url.toString());
        
        // Direct request to webhook with query parameters
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'omit'
        });
        
        let data = await response.json();
        console.log('Webhook response:', data);
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
            console.warn('Response is not an array:', data);
            data = [data];
        }
        
        // Filter out any null or invalid entries
        data = data.filter(item => item && item["Session ID"] && item.Timestamp);
        console.log('Processed data array:', data);
        
        // Process and update dashboard
        const processed = processWebhookData(data);
        console.log('Processed metrics:', processed);
        
        storeLastData(data); // Store the latest data
        const now = Date.now();
        const lastHalfHour = getMostRecentHalfHourMark(now);
        storeLastUpdated(lastHalfHour); // Store the last updated half-hour mark
        
        updateDashboard(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Full error details:', error.message);
    }
}

// Initialize empty charts
const initCharts = () => {
    // Messages chart
    const messagesCtx = document.getElementById('messagesChart').getContext('2d');
    messagesChart = new Chart(messagesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Messages',
                data: [],
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        precision: 0,
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });

    // Appointments chart
    const appointmentsCtx = document.getElementById('appointmentsChart').getContext('2d');
    appointmentsChart = new Chart(appointmentsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Appointments',
                data: [],
                backgroundColor: '#2563eb',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        precision: 0,
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
};

// Handle timeframe selection
const handleTimeframeSelection = () => {
    const timeButtons = document.querySelectorAll('.time-btn');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // TODO: Add timeframe filtering when webhook is connected
            // Will filter data based on selected timeframe (7d, 30d, 90d)
        });
    });
};

// Handle fullscreen functionality
const handleFullscreen = () => {
    const fullscreenButtons = document.querySelectorAll('.fullscreen-btn');
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
    });
    
    fullscreenButtons.forEach(button => {
        button.addEventListener('click', () => {
            const chartCard = button.closest('.chart-card');
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                chartCard.requestFullscreen();
            }
        });
    });
};

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', () => {
    const fullscreenCard = Array.from(document.querySelectorAll('.chart-card')).find(card => card === document.fullscreenElement);
    document.querySelectorAll('.chart-card.fullscreen').forEach(card => card.classList.remove('fullscreen'));
    if (fullscreenCard) {
        fullscreenCard.classList.add('fullscreen');
        setTimeout(() => {
            const chartId = fullscreenCard.querySelector('canvas').id;
            const chart = chartId === 'messagesChart' ? messagesChart : appointmentsChart;
            chart.resize();
            chart.options.scales.y.suggestedMax = chart.options.scales.y.suggestedMax;
            chart.update('none');
        }, 100);
    }
});

// Handle download buttons
const handleDownloadButtons = () => {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const chartCard = button.closest('.chart-card');
            const chartId = chartCard.querySelector('canvas').id;
            const chart = chartId === 'messagesChart' ? messagesChart : appointmentsChart;
            
            // Download as PNG image
            const link = document.createElement('a');
            link.href = chart.toBase64Image();
            const title = chartId === 'messagesChart' ? 'messages' : 'appointments';
            link.download = `${title}_chart_${new Date().toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
};

// Call this after DOMContentLoaded to ensure download buttons work
handleDownloadButtons();

// Update chart data based on timeframe
const updateChartData = (timeframe) => {
    let days;
    let messagesBase;
    let messagesVariance;
    let appointmentsBase;
    let appointmentsVariance;

    switch(timeframe) {
        case '7d':
            days = 7;
            messagesBase = 3500;
            messagesVariance = 500;
            appointmentsBase = 180;
            appointmentsVariance = 30;
            break;
        case '30d':
            days = 30;
            messagesBase = 4000;
            messagesVariance = 800;
            appointmentsBase = 200;
            appointmentsVariance = 40;
            break;
        case '90d':
            days = 90;
            messagesBase = 4500;
            messagesVariance = 1000;
            appointmentsBase = 220;
            appointmentsVariance = 50;
            break;
        default:
            days = 7;
            messagesBase = 3500;
            messagesVariance = 500;
            appointmentsBase = 180;
            appointmentsVariance = 30;
    }

    const messagesData = generateData(days, messagesBase, messagesVariance);
    const appointmentsData = generateData(days, appointmentsBase, appointmentsVariance);

    // Update messages chart
    messagesChart.data.labels = messagesData.labels;
    messagesChart.data.datasets[0].data = messagesData.data;
    messagesChart.update();

    // Update appointments chart
    appointmentsChart.data.labels = appointmentsData.labels;
    appointmentsChart.data.datasets[0].data = appointmentsData.data;
    appointmentsChart.update();

    // Update metrics
    updateMetrics(timeframe);
};

// Update metrics based on timeframe
const updateMetrics = (timeframe) => {
    const metrics = {
        '24h': {
            'Appointments Booked': '1,234',
            'Total Messages': '45,678',
            'Messages per Booking': '37'
        },
        '7d': {
            'Appointments Booked': '8,765',
            'Total Messages': '321,456',
            'Messages per Booking': '37'
        },
        '30d': {
            'Appointments Booked': '32,109',
            'Total Messages': '1,234,567',
            'Messages per Booking': '38'
        }
    };

    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach(metric => {
        const metricName = metric.parentElement.querySelector('h3').textContent;
        const newValue = metrics[timeframe][metricName];
        
        // Animate the value change
        const currentValue = parseInt(metric.textContent.replace(/,/g, ''));
        const targetValue = parseInt(newValue.replace(/,/g, ''));
        animateValue(metric, currentValue, targetValue, 1000);
    });
};

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = end.toLocaleString();
        } else {
            element.textContent = Math.round(current).toLocaleString();
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    handleTimeframeSelection();
    handleFullscreen();
    fetchIfNeededOnLoad();
});

// Add this helper to fade elements
function fadeOutIn(elements, callback, afterFadeIn) {
    elements.forEach(el => {
        el.style.transition = 'opacity 0.35s cubic-bezier(0.4,0,0.2,1)';
        el.style.opacity = '0';
    });
    setTimeout(() => {
        if (callback) callback();
        elements.forEach(el => {
            el.style.opacity = '1';
        });
        if (afterFadeIn) setTimeout(afterFadeIn, 350);
    }, 350);
}

// Enhanced timeframe button logic
document.addEventListener('DOMContentLoaded', function() {
    const timeButtons = document.querySelectorAll('.time-btn');
    const metrics = document.querySelectorAll('.metric-card');
    const charts = document.querySelectorAll('.chart-card');
    const metricValues = document.querySelectorAll('.metric-value');
    const chartWrappers = document.querySelectorAll('.chart-wrapper');
    const chartCanvases = document.querySelectorAll('.chart-wrapper canvas');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show loading dots
            metricValues.forEach(val => {
                val.classList.add('loading-dots');
                val.innerHTML = '<span></span><span></span><span></span>';
            });
            chartWrappers.forEach(wrap => wrap.classList.add('updating'));

            // Hide chart canvases for pop-in effect
            chartCanvases.forEach(canvas => {
                canvas.style.visibility = 'hidden';
            });
            
            // Fade out metrics and charts, then fetch and update
            fadeOutIn([...metrics, ...charts], () => {
                // Get timeframe and fetch data
                const timeframe = this.getAttribute('data-timeframe');
                fetchData(timeframe).then(() => {
                    // Remove loading dots after data update
                    metricValues.forEach(val => {
                        val.classList.remove('loading-dots');
                    });
                    chartWrappers.forEach(wrap => wrap.classList.remove('updating'));
                });
            }, () => {
                // After fade-in, pop in the chart canvases
                chartCanvases.forEach(canvas => {
                    canvas.style.visibility = 'visible';
                    canvas.style.animation = 'popIn 0.35s cubic-bezier(0.4,0,0.2,1)';
                    setTimeout(() => { canvas.style.animation = ''; }, 400);
                });
            });
        });
    });
});

// Set up auto-refresh every 5 minutes
setInterval(() => {
    const activeTimeframe = document.querySelector('.time-btn.active').getAttribute('data-timeframe');
    fetchData(activeTimeframe);
}, 5 * 60 * 1000);

// On page load, align fetches to half-hour marks
function fetchIfNeededOnLoad() {
    const now = Date.now();
    const lastFetch = getLastFetchTime();
    const lastHalfHour = getMostRecentHalfHourMark(now);
    const nextHalfHour = getNextHalfHourMark(now);
    const activeTimeframeBtn = document.querySelector('.time-btn.active');
    if (!activeTimeframeBtn) {
        setTimeout(fetchIfNeededOnLoad, 100);
        return;
    }
    const activeTimeframe = activeTimeframeBtn.getAttribute('data-timeframe');
    const lastUpdated = parseInt(loadLastUpdated() || '0', 10);
    if (lastUpdated < lastHalfHour) {
        // Need to fetch for this half-hour mark
        fetchData(activeTimeframe).then(() => {
            setLastFetchTime(Date.now());
            setupPolling();
        });
    } else {
        // Load and display last data if available
        const lastData = loadLastData();
        if (lastData) {
            updateDashboard(lastData);
        }
        // Wait until the next half-hour mark
        const waitTime = nextHalfHour - now;
        setTimeout(() => {
            fetchData(activeTimeframe).then(() => {
                setLastFetchTime(Date.now());
                setupPolling();
            });
        }, waitTime);
    }
}

// Set up polling to always fetch at the next half-hour mark
function setupPolling() {
    setInterval(() => {
        const activeTimeframeBtn = document.querySelector('.time-btn.active');
        if (!activeTimeframeBtn) return;
        const activeTimeframe = activeTimeframeBtn.getAttribute('data-timeframe');
        fetchData(activeTimeframe).then(() => setLastFetchTime(Date.now()));
    }, 30 * 60 * 1000);
} 