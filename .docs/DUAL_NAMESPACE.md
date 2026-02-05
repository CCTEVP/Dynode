## Dual Namespace Environment Model

To support both browser-facing URLs and internal container-to-container calls, each service now exposes two groups of endpoints:

### 1. externalOrigins

Human/browser accessible addresses (host port mappings or public domains). These are the values that appear in generated Swagger docs, are whitelisted for CORS, and are safe to embed in HTML.

### 2. internalServices

Docker network hostnames used for service-to-service communication (e.g. `http://source`, `http://render`, `http://build`). These should never be emitted to the browser because they are not resolvable outside the Docker network.

| Layer                   | Purpose                                 | Example (docker)      |
| ----------------------- | --------------------------------------- | --------------------- |
| externalOrigins.source  | Browser hits API                        | http://localhost:3000 |
| internalServices.source | render/build containers call source API | http://source         |

### Helper Functions

Each package exposes convenience helpers:

build.dynode/config/env.ts

```
getSourceApiBase()  // internal in docker, external otherwise
getRenderBase()     // always external origin
```

render.dynode/config.ts

```
getSourceApiBase()      // internal vs external
getRenderPublicBase()   // external render base
```

source.dynode/config.ts

```
getSourcePublicBase()   // external source base
getRenderPublicBase()   // external render base
getInternalService(name) // generic internal lookup
```

### Migration Notes

Legacy single set fields (sourceApi, renderBase, builderBase, origins) were removed. Update any remaining imports to use the helpers or the explicit `externalOrigins` / `internalServices` objects.

### CORS

`allowedOrigins` is derived strictly from `externalOrigins` to prevent internal hostnames from being inadvertently exposed.

### When Adding a New Service

1. Add entries to both namespaces.
2. Decide if the service needs to be exposed externally; if not, externalOrigins can omit it (leave undefined) but internalServices must still have a DNS name.
3. Provide helper accessors if you need consistent patterns across codebases.

### Rationale

This separation prevents accidental leakage of internal DNS names to clients and avoids failures when code inside containers attempts to reach another service using a host-mapped port that is only valid from the developer machine.
