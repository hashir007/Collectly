# Collectly (Frontend)

Welcome to the **Collectly**, a comprehensive frontend application built to manage shared pools, member contributions, payouts, and more. This project provides a complete set of features to facilitate user authentication, real-time notifications, and robust pool management.

## Features

-   **User Authentication & Security**: Complete authentication flow including login, registration, password reset, and email verification.
-   **Dashboard**: A centralized place to get an overview of your active pools, recent activities, and account status.
-   **Pool Management**: Create new pools, edit existing ones, browse available pools, and join pools seamlessly.
-   **Member & Payout Tracking**: Track pool members and manage pool payouts with dedicated views.
-   **Payment Integration**: Native PayPal integration via `@paypal/react-paypal-js`.
-   **Real-time Notifications**: Instant alerts using `socket.io-client` alongside `react-hot-toast` and `react-notifications`.
-   **Data Visualization**: Integrated with `react-google-charts` for clear and informative charts.
-   **Responsive UI**: Styled using `bootstrap` and `react-bootstrap` for a modern and accessible layout across devices.

## Tech Stack

-   **Framework**: React (v18.2.0)
-   **State Management**: Redux Toolkit & React-Redux
-   **Routing**: React Router DOM
-   **HTTP Client**: Axios
-   **Sockets**: Socket.io Client
-   **Forms & Validation**: Formik & Yup
-   **Styling**: Bootstrap, App-specific CSS (via `App.css` and `index.css`)

## Getting Started

### Prerequisites

-   Node.js (v14 or higher is recommended)
-   npm or yarn
-   Valid local SSL certificates (if using the default start script which uses HTTPS)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd Collectly
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:

    The `start` script is customized to run on HTTPS using specific local SSL files:
    ```bash
    npm start
    ```
    *Note: If you run into issues with the default `start` script regarding missing certificates from `E:/Local Trusted Certificate/`, you can modify `package.json` by temporarily falling back to standard `react-scripts start`.*

4.  **Build for production**:
    ```bash
    npm run build
    ```

## Project Structure Highlights

-   **`src/App.js`**: Core routing configuration using `react-router-dom` and integration of top-level providers.
-   **`src/app/pages/`**: Contains the page components (e.g., `Dashboard`, `Login`, `Pools`, `PoolDetails`, `Payouts`).
-   **`src/app/slices/`**: Redux toolkit slices handling application state.
-   **`src/app/common/`**: Common assets or tools, shared components, and the event-bus.

## Contributing

Feel free to open issues or submit pull requests with improvements.

## License

This project is proprietary. Please contact the repository owner for licensing details.
