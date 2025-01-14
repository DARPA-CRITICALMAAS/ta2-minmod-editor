import { RStore } from "gena-app";
import { SERVER } from "env";
import { runInAction } from "mobx";
import axios from "axios";

export interface User {
  id: string;
  url: string;
  email: string;
  name: string;
}

// export class UserStore extends RStore<string, User> {
//   constructor() {
//     super(`${SERVER}/api/v1`, { id: "username" }, false);
//   }

//   async login(username: string, password: string) {
//     let resp = await axios.post(`${SERVER}/api/v1/login`, { username, password });
//     runInAction(() => {
//       this.set(this.deserialize(resp.data));
//     });
//     const isLoggedIn = await this.isLoggedIn();
//     console.log("Post-login isLoggedIn Check:", isLoggedIn);
//   }
//   public isLoggingOut: boolean = false;


//   async isLoggedIn(): Promise<boolean> {
//     if (this.isLoggingOut) {
//       console.log("Skipping isLoggedIn check during logout.");
//       return false;
//     }

//     if (this.records.size > 0) {
//       console.log("User is already logged in (records present).");
//       return true;
//     }

//     try {
//       const resp = await axios.get(`${SERVER}/api/v1/whoami`);
//       console.log("WhoAmI API Response:", resp.data);
//       runInAction(() => {
//         this.set(this.deserialize(resp.data));
//       });
//       return true;
//     } catch (err) {
//       console.error("Error during isLoggedIn check:", err);
//       return false;
//     }
//   }



//   public getCurrentUser(): User | undefined {
//     if (this.records.size === 0) return undefined;
//     return this.records.values().next().value || undefined;
//   }

//   public deserialize(obj: any): User {
//     return {
//       id: obj.username,
//       email: obj.email,
//       name: obj.name,
//       url: obj.uri,
//     };
//   }

//   async logout() {
//     try {
//       this.isLoggingOut = true;
//       runInAction(() => {
//         this.records.clear();
//       });

//       const allCookies = document.cookie.split(";");
//       for (let i = 0; i < allCookies.length; i++) {
//         const cookie = allCookies[i];
//         const eqPos = cookie.indexOf("=");
//         const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//         document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
//       }
//       console.log("Clearing user records and setting loggedOut flag");

//       console.log("Logout successful");
//     } catch (err) {
//       console.error("Error during logout:", err);
//     }
//     finally {
//       this.isLoggingOut = false;
//     }
//   }

// }

export class UserStore extends RStore<string, User> {
  public isLoggingOut: boolean = false;
  public isSessionValidation: boolean = false; // Track session validation state

  constructor() {
    super(`${SERVER}/api/v1`, { id: "username" }, false);
  }

  // Login method
  async login(username: string, password: string) {
    try {
      const resp = await axios.post(`${SERVER}/api/v1/login`, { username, password });
      console.log("Login API Response:", resp.data);

      // Set user data after successful login
      runInAction(() => {
        this.set(this.deserialize(resp.data));
      });

      // Validate session with whoami
      const isLoggedIn = await this.validateSession();
      console.log("Post-login isLoggedIn Check:", isLoggedIn);
    } catch (err) {
      console.error("Error during login:", err);
    }
  }
  public isLoadingUser: boolean = false;
  // Validate session explicitly using whoami
  async validateSession(): Promise<boolean> {
    this.isLoadingUser = true;
    this.isSessionValidation = true; // Mark session validation in progress
    try {
      const resp = await axios.get(`${SERVER}/api/v1/whoami`);
      console.log("WhoAmI API Response:", resp.data);

      // Update user data if whoami is successful
      runInAction(() => {
        this.set(this.deserialize(resp.data));
      });
      return true;
    } catch (err) {
      console.error("Error during session validation:", err);
      return false;
    } finally {
      this.isSessionValidation = false; // Reset session validation flag
      this.isLoadingUser = false
    }
  }

  // isLoggedIn check
  async isLoggedIn(): Promise<boolean> {

    // Skip if logout is in progress or session validation is already running
    if (this.isLoggingOut || this.isSessionValidation) {
      console.log("Skipping isLoggedIn check.");
      return false;
    }

    if (this.records.size > 0) {
      console.log("User is already logged in (records present).");
      return true;
    }

    // else, validate session
    return await this.validateSession();
  }

  // Get the current user
  public getCurrentUser(): User | undefined {
    if (this.records.size === 0) return undefined;
    return this.records.values().next().value || undefined;
  }

  // Deserialize user data
  public deserialize(obj: any): User {
    return {
      id: obj.username,
      email: obj.email,
      name: obj.name,
      url: obj.uri,
    };
  }

  // Logout method
  async logout() {
    try {
      console.log("Logout started.");
      this.isLoggingOut = true; // Prevent further isLoggedIn or whoami calls

      // Clear user records
      runInAction(() => {
        this.records.clear();
      });

      // Clear cookies
      const allCookies = document.cookie.split(";");
      for (let i = 0; i < allCookies.length; i++) {
        const cookie = allCookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
      console.log("User records cleared and cookies deleted.");
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      this.isLoggingOut = false; // Reset the logout flag
      console.log("Logout completed.");
    }
  }
}
