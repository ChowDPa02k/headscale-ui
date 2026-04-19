# Headscale UI
[![main](https://github.com/simcu/headscale-ui/actions/workflows/main.yml/badge.svg)](https://github.com/simcu/headscale-ui/actions/workflows/main.yml)

Headscale UI is a static admin interface for Headscale. It does not require its own backend service and can be served by any static web server.

## Compatibility

This fork has been updated for Headscale `v0.28`.

Current support status:

- `v0.28`: supported
- `v0.23` to `v0.27`: login option kept for compatibility, but this release is primarily validated against `v0.28`
- `v0.22` and below: legacy option still exists in the login screen, but not covered by the latest validation

## What Changed For Headscale v0.28

Headscale `v0.28` changed several API behaviors compared with older releases. This update aligns the UI with the newer API by:

- switching machine operations to the `/api/v1/node` endpoints
- updating user operations to use user IDs where required by newer API handlers
- updating pre-auth key operations to use the current request and response shapes
- updating route approval actions to use node route approval APIs instead of the old route management flow
- adjusting login defaults to prefer `v0.28`
- improving request handling and error messages during login

## API Compatibility Note

This update removes the old version-switching logic for the legacy machine endpoints in the Angular API service.

In practice:

- the UI now uses the Headscale `v0.28` node APIs as the primary implementation
- legacy `/api/v1/machine/...` request branches were removed from the client service
- legacy standalone route management calls were also removed from the client service
- route updates are now performed through node approved-route APIs

To reduce UI churn, several Angular service method names still keep the historical `machine*` naming, but they now call `/api/v1/node/...` endpoints internally.

This means the current codebase is no longer a full dual-path implementation for both old `machine` APIs and newer `node` APIs.

## Current Functional Notes

The `v0.28` flow was validated for:

- login
- user listing, rename, and delete
- node listing
- node registration
- node rename
- node expiry and delete
- route approval and removal through approved routes
- pre-auth key list, create, and expire

Known limitation in `v0.28` mode:

- tag editing is currently shown as read-only in the machine view

## Requirements

1. Generate an API key with the Headscale CLI:

   ```bash
   headscale apikeys create -e 9999d
   ```

2. Host the built UI on a static web server, or run it with Docker
3. If the UI is hosted on a different origin from Headscale, configure CORS on the Headscale side

## Deployment

### Static Hosting

Build the application and serve the output directory with any static web server.

### Docker

```bash
docker run -d --name headscale-ui -p 8888:80 simcu/headscale-ui
```

Then open:

```text
http://127.0.0.1:8888/manager/
```

If the UI is not hosted on the same origin as Headscale:

1. open the login page
2. click `Change Server`
3. enter the Headscale server URL
4. enter the API key
5. log in

### Caddy Example

```caddy
domain.com {
    @ui {
        path_regexp (/$)|(\.)
    }

    handle @ui {
        root * /www/headscale-ui
        try_files {path} /index.html
        file_server
    }

    reverse_proxy 127.0.0.1:7070
}
```

## Security Notice

- `serverUrl` and `apiKey` are stored in `localStorage` in plain text
- users usually only need to log in once
- if the API key becomes invalid, the UI will require login again

## Credits

- Headscale: https://github.com/juanfont/headscale
- NG-ZORRO: https://github.com/NG-ZORRO/ng-zorro-antd
- Angular: https://angular.io/
