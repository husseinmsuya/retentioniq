import json
import os
from groq import Groq, APITimeoutError, APIConnectionError, APIStatusError


def is_greeting(question: str) -> bool:
    q = question.lower().strip()
    greetings = [
        "hi", "hello", "hey", "habari", "mambo", "niaje", "oi",
        "good morning", "good afternoon", "good evening"
    ]
    return q in greetings or any(q.startswith(g) for g in greetings)


def asks_for_explanation(question: str) -> bool:
    q = question.lower()
    explanation_words = [
        "why", "how", "explain", "reason", "reasons", "driver", "drivers",
        "kwa nini", "kwanini", "mbona", "elezea", "fafanua", "sababu"
    ]
    return any(word in q for word in explanation_words)


def generate_insight(question: str, context: dict):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        return {
            "status": "groq_not_configured",
            "answer": None,
            "message": "Set GROQ_API_KEY to enable AI executive insights and chat responses."
        }

    client = Groq(
        api_key=api_key,
        timeout=20.0,
        max_retries=1
    )

    has_real_data = (
        isinstance(context, dict)
        and context.get("totalCustomers", 0) > 0
        and (
            "revenueAtRisk" in context
            or "topRiskCustomers" in context
            or "highRiskCustomers" in context
            or "geographyBreakdown" in context
            or "cardTypeBreakdown" in context
        )
    )

    wants_explanation = asks_for_explanation(question)

    if is_greeting(question):
        if has_real_data:
            context_block = f"Business context:\n{json.dumps(context, indent=2)}"
            data_instruction = """
The user is greeting you. Reply warmly and briefly.
Introduce yourself as RetentionIQ AI.
Mention that their uploaded churn data is available and you can answer questions about customers, churn risk, revenue at risk, geography, card type, and recommendations.
Do not provide analysis unless the user asks for it.
"""
        else:
            context_block = ""
            data_instruction = """
The user is greeting you.
Reply warmly and briefly.
Introduce yourself as RetentionIQ AI.
Explain that you help analyze customer churn, risk levels, revenue at risk, customer segments, and retention actions.
Invite the user to upload a customer dataset or select a customer.
Do not invent numbers or business insights.
"""
    elif has_real_data:
        context_block = f"Business context:\n{json.dumps(context, indent=2)}"

        if wants_explanation:
            data_instruction = """
Answer the user's question using ONLY the provided business context.

The user is asking for an explanation, not just a number.
Give a clear business explanation using available evidence.

When explaining revenue at risk, consider:
- revenueAtRisk
- totalEstimatedSalary
- highRiskCustomers
- criticalRiskCustomers
- expectedChurnRate
- averageRiskScore
- topRiskCustomers
- highRiskGeographyBreakdown
- highRiskCardTypeBreakdown
- inactiveCustomers
- lowSatisfactionCustomers

Explain WHY the value is high only from these fields.
If a specific driver is not available in context, do not mention it.
Do not invent causes.

Recommended response style:
- Start with the direct answer.
- Then explain the main reasons from the uploaded data.
- Mention the business impact.
- End with practical retention actions.
"""
        else:
            data_instruction = """
Answer the user's question using ONLY the provided business context.

Important:
- If the user asks about revenue at risk, use revenueAtRisk.
- If the user asks about number of customers, use totalCustomers.
- If the user asks about high-risk customers, use highRiskCustomers and topRiskCustomers.
- If the user asks about churn rate, use expectedChurnRate.
- If the user asks about geography risk, use highRiskGeographyBreakdown.
- If the user asks about card type risk, use highRiskCardTypeBreakdown.
- If the user asks about inactive customers, use inactiveCustomers.
- If the user asks about low satisfaction customers, use lowSatisfactionCustomers.
- Do not invent fields or business drivers outside the provided context.
- Answer only what was asked, but include enough explanation to be useful.
"""
    else:
        context_block = ""
        data_instruction = """
No uploaded prediction data is available yet.
If the user asks a data question, explain briefly that no uploaded prediction data is available yet.
Ask them to upload a customer dataset first.
Do not invent customer numbers, revenue values, churn rates, or drivers.
"""

    prompt = f"""
You are RetentionIQ AI, a professional customer churn analytics assistant.

{data_instruction}

Allowed business fields:
CreditScore, Geography, Gender, Age, Tenure, Balance, NumOfProducts,
HasCrCard, IsActiveMember, SatisfactionScore, CardType, PointsEarned,
EstimatedSalary, churnProbability, riskLevel, prediction,
totalCustomers, highRiskCustomers, criticalRiskCustomers, expectedChurnRate,
averageRiskScore, totalEstimatedSalary, revenueAtRisk,
lowSatisfactionCustomers, inactiveCustomers,
geographyBreakdown, highRiskGeographyBreakdown,
cardTypeBreakdown, highRiskCardTypeBreakdown,
genderBreakdown, topRiskCustomers.

Strict rules:
1. Use only the provided context.
2. Never invent numbers.
3. Never mention complaints, transactions, support tickets, customer service ratings, or price sensitivity unless those exact fields exist in context.
4. If the answer cannot be derived from context, say so clearly.
5. Do not expose JSON or technical field names to the user.
6. Keep answers focused on the user's question.
7. If the question asks "why", "how", or asks for reasons, explain using available data instead of giving only one number.
8. Use business-friendly language.

User question:
{question}

{context_block}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are RetentionIQ AI. You are warm, professional, and strictly data-grounded. "
                        "Never invent facts outside the provided context. If the user asks why or how, explain using only the provided data."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.25,
            max_tokens=700
        )

        return {
            "status": "success",
            "answer": completion.choices[0].message.content
        }

    except APITimeoutError:
        return {
            "status": "groq_timeout",
            "answer": (
                "Groq AI request timed out. Please try again in a moment. "
                "Your uploaded RetentionIQ data is still available, but the AI service did not respond in time."
            )
        }

    except APIConnectionError:
        return {
            "status": "groq_connection_error",
            "answer": (
                "RetentionIQ AI could not connect to Groq right now. "
                "Please check your internet connection and try again."
            )
        }

    except APIStatusError as error:
        return {
            "status": "groq_api_error",
            "answer": f"Groq returned an API error: {error.status_code}. Please try again shortly."
        }

    except Exception as error:
        return {
            "status": "ai_error",
            "answer": f"AI insight failed: {str(error)}"
        }