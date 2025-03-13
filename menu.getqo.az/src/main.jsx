import { ThemeProvider } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import theme from "./config/theme";
import "./index.css";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-spring-bottom-sheet/dist/style.css";
import ErrorPage from "./routes/error";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/query";
import { CartProvider } from "./context/cart/provider";
import { SettingsProvider } from "./context/settings/provider.jsx";
import { CurrencyProvider } from "./context/currency/provider.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    lazy: async () => {
      const { OrderLayout } = await import("./layout/order");
      return { Component: OrderLayout };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const HomePage = await import("./routes/home");
          return { Component: HomePage.default };
        },
      },
      {
        path: "/feedback",
        lazy: async () => {
          const FeedbackPage = await import("./routes/feedback");
          return { Component: FeedbackPage.default };
        },
      },
      {
        path: "/payment",
        lazy: async () => {
          const PaymentPage = await import("./routes/payment");
          return { Component: PaymentPage.default };
        },
      },
      {
        path: "/",
        lazy: async () => {
          const { MainLayout } = await import("./layout/main");
          return { Component: MainLayout };
        },
        children: [
          {
            path: "/menu",
            lazy: async () => {
              const MenuList = await import("./routes/menu/menu-list");
              return { Component: MenuList.default };
            },
          },
          {
            path: "/menu/:id",
            lazy: async () => {
              const MenuPage = await import("./routes/menu");
              return { Component: MenuPage.default };
            },
          },
        ],
      },
      {
        path: "/order",
        lazy: async () => {
          const OrderPage = await import("./routes/order");
          return { Component: OrderPage.default };
        },
      },
      {
        path: "/book",
        lazy: async () => {
          const MenuBookPage = await import("./routes/menu-book");
          return { Component: MenuBookPage.default };
        },
      },
      {
        path: "/stagger",
        lazy: async () => {
          const StaggerPage = await import("./routes/stagger");
          return { Component: StaggerPage.default };
        },
      },
      {
        path: "/w2",
        children: [
          {
            index: true,
            lazy: async () => {
              const W2Home = await import("./routes/w2/home");
              return { Component: W2Home.default };
            },
          },
          {
            path: "menu",
            lazy: async () => {
              const W2Menu = await import("./routes/w2/menu");
              return { Component: W2Menu.default };
            },
          },
          {
            path: "order",
            lazy: async () => {
              const W2Order = await import("./routes/w2/order");
              return { Component: W2Order.default };
            },
          },
          {
            path: "feedback",
            lazy: async () => {
              const W2Feedback = await import("./routes/w2/feedback");
              return { Component: W2Feedback.default };
            },
          },
          {
            path: "payment",
            lazy: async () => {
              const W2Payment = await import("./routes/w2/payment");
              return { Component: W2Payment.default };
            },
          },
          {
            path: "promotion/:id",
            lazy: async () => {
              const W2Promotion = await import("./routes/w2/promotion");
              return { Component: W2Promotion.default };
            },
          },
          {
            path: "search",
            lazy: async () => {
              const SearchPage = await import("./routes/w2/search");
              return { Component: SearchPage.default };
            },
          },
        ],
      },
      {
        path: "/w3",
        children: [
          {
            index: true,
            lazy: async () => {
              const W3Home = await import("./routes/w3/home");
              return { Component: W3Home.default };
            },
          },
          {
            path: "menu",
            lazy: async () => {
              const W3Menu = await import("./routes/w3/menu");
              return { Component: W3Menu.default };
            },
          },
          {
            path: "order",
            lazy: async () => {
              const W3Order = await import("./routes/w3/order");
              return { Component: W3Order.default };
            },
          },
          {
            path: "feedback",
            lazy: async () => {
              const W3Feedback = await import("./routes/w3/feedback");
              return { Component: W3Feedback.default };
            },
          },
          {
            path: "payment",
            lazy: async () => {
              const W3Payment = await import("./routes/w3/payment");
              return { Component: W3Payment.default };
            },
          },
          {
            path: "promotion/:id",
            lazy: async () => {
              const W3Promotion = await import("./routes/w3/promotion");
              return { Component: W3Promotion.default };
            },
          },
          {
            path: "search",
            lazy: async () => {
              const SearchPage = await import("./routes/w3/search");
              return { Component: SearchPage.default };
            },
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SettingsProvider>
          <CurrencyProvider>
            <CartProvider>
              <RouterProvider router={router} />
            </CartProvider>
          </CurrencyProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
