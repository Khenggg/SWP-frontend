# Frontend Mock API Rules

Muc tieu: UI van goi API nhu that. Khi backend san sang, chi can tat flag mock, khong sua page.

## Nguyen tac

1. Page khong import mock data truc tiep.
2. Page chi goi service, vi du `driverBookingService.getBookings()`.
3. Service chi goi axios client, vi du `coreAxiosClient.get("/driver/bookings")`.
4. Mock data nam trong `frontend/src/mocks/data`.
5. Mock endpoint nam trong `frontend/src/mocks/handlers.js`.
6. Bat/tat mock bang env flag `VITE_MOCK_*`.
7. Endpoint khong bat mock se tu dong di real API do `onUnhandledRequest: "bypass"`.

## Cau truc

```txt
frontend/src/
  api/
    coreAxiosClient.js
    publicAxiosClient.js
    supportAxiosClient.js
  services/
    driverBookingService.js
  mocks/
    browser.js
    handlers.js
    index.js
    mockConfig.js
    data/
      driverData.js
      parkingData.js
```

## Bat mock

Tao `frontend/.env.local` tu `frontend/.env.example`:

```env
VITE_CORE_API_URL=http://localhost:5000/api/core
VITE_PUBLIC_API_URL=http://localhost:8080/api/public
VITE_SUPPORT_API_URL=http://localhost:8080/api/support

VITE_MOCK_DRIVER_BOOKINGS=true
VITE_MOCK_DRIVER_HISTORY=false
```

Ket qua:

- `GET /driver/bookings` dung mock.
- `GET /driver/bookings/history` dung real API.
- Cac endpoint khac dung real API.

Sau khi doi env, restart Vite dev server.

## Them mock endpoint moi

1. Them flag vao `frontend/src/mocks/mockConfig.js`:

```js
export const MOCK_FLAGS = {
  DRIVER_BOOKINGS: "VITE_MOCK_DRIVER_BOOKINGS",
  DRIVER_HISTORY: "VITE_MOCK_DRIVER_HISTORY",
  SUPPORT_TICKETS: "VITE_MOCK_SUPPORT_TICKETS",
};
```

2. Them data vao `frontend/src/mocks/data`:

```js
export const supportTickets = [
  { id: 1, title: "Mat the", status: "OPEN" },
];
```

3. Them handler vao `frontend/src/mocks/handlers.js`:

```js
...enabled(
  MOCK_FLAGS.SUPPORT_TICKETS,
  http.get(`${API_BASE_URLS.support}/tickets`, async () => {
    await delay(250);
    return ok(supportTickets);
  })
),
```

4. Them env flag:

```env
VITE_MOCK_SUPPORT_TICKETS=true
```

## Service pattern

Dung service de sau nay khong sua UI:

```js
import coreAxiosClient from "../api/coreAxiosClient";

export const driverBookingService = {
  getBookings: () => coreAxiosClient.get("/driver/bookings"),
  getHistory: () => coreAxiosClient.get("/driver/bookings/history"),
};
```

Trong page:

```js
const res = await driverBookingService.getBookings();
setBookings(res.data);
```

## Response shape

Mock va real API nen cung format:

```json
{
  "success": true,
  "message": "OK",
  "data": []
}
```

Neu backend tra format khac, sua o service hoac axios interceptor, khong sua tung page.

## Khi backend san sang

Tat flag endpoint tuong ung:

```env
VITE_MOCK_DRIVER_BOOKINGS=false
```

Khong can xoa mock ngay. Giu lai de test UI offline hoac demo.

## Luu y

- MSW chi chay khi co it nhat mot `VITE_MOCK_* = true`.
- `frontend/public/mockServiceWorker.js` la file bat buoc cua MSW.
- Khong commit `.env.local`.
- Handler nen dung dung URL theo axios base URL de tranh mock sai service.
