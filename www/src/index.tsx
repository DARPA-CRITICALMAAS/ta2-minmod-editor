import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "gena-app";
import reportWebVitals from "./reportWebVitals";
import { stores, initStores, StoreContext } from "./models";
import { routes } from "./routes";
import enUSIntl from "antd/lib/locale/en_US";
import { ConfigProvider } from "antd";
import { InitNonCriticalStores } from "./components/StoreInit";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

initStores().then(() => {
  root.render(
    <StoreContext.Provider value={stores}>
      <ConfigProvider locale={enUSIntl}>
        <InitNonCriticalStores>
          <App enUSLocale={true} routes={routes} strict={false} />
        </InitNonCriticalStores>
      </ConfigProvider>
    </StoreContext.Provider>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
