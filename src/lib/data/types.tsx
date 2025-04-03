// export interface Booking {
//   id: string;
//   date: Date;
//   startTime: string;
//   client: {
//     name: string;
//     email: string;
//   };
//   sessionType: "CONSULTATION" | "FULL_SESSION";
// }
export interface Booking {
  id: string;
  clientId: string;
  client: {
    name: string;
    email?: string;
  };
  sessionType: "CONSULTATION" | "FULL_SESSION";
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  duration: string;
}
