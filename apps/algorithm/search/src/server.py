from fastapi import FastAPI, Request, HTTPException
import jwt
import os

from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


from .routes import search_router

app = FastAPI()


@app.middleware("http")
async def authenticate_request(request: Request, call_next):
    # Allow the healthcheck to pass auth
    if request.url.path == "/.well-known/health":
        response = await call_next(request)
        return response

    auth_token = request.cookies.get("authorization")

    if not auth_token:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not os.getenv("PYTEST_CURRENT_TEST"):
        try:
            decoded = jwt.decode(
                auth_token, os.getenv("JWT_PUBLIC_KEY"), algorithms=["RS256"]
            )
            request.state.user = decoded["userId"]
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except Exception as e:
            print(e)
            raise HTTPException(status_code=401, detail="Invalid token")
    else:
        request.state.user = int(auth_token)

    response = await call_next(request)
    return response


def otel_trace_init(app, name):
    trace.set_tracer_provider(
        TracerProvider(
            resource=Resource.create({"service.name": name}),
        ),
    )
    otlp_span_exporter = OTLPSpanExporter(endpoint=os.getenv("OTEL_COLLECTOR_ENDPOINT"))
    trace.get_tracer_provider().add_span_processor(
        BatchSpanProcessor(otlp_span_exporter)
    )
    FastAPIInstrumentor.instrument_app(app)
    return app


app = otel_trace_init(app, "search")
app.include_router(search_router)
