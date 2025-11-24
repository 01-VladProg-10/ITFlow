# ITFlow/exceptions.py
import logging
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger("itflow")


def custom_exception_handler(exc, context):
    """
    Оборачиваем стандартные ошибки DRF в единый JSON-формат.
    """
    response = drf_exception_handler(exc, context)

    view = context.get("view")
    view_name = view.__class__.__name__ if view else "UnknownView"

    if response is not None:
        logger.warning("Handled API error", extra={
            "view": view_name,
            "status_code": response.status_code,
            "details": response.data,
        })

        return Response(
            {
                "success": False,
                "errors": response.data
            },
            status=response.status_code
        )

    # Нестандартная ошибка (500 и т.п.)
    logger.error("Unhandled server error", exc_info=exc, extra={
        "view": view_name,
    })

    return Response(
        {
            "success": False,
            "errors": {"detail": "Internal server error."}
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
