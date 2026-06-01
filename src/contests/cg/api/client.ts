import chalk from "chalk"

const BASE_URL = "https://www.codingame.com/services/"
const REMEMBER_ME_ENV = "CG_REMEMBER_ME"
const USER_ID_ENV = "CG_USER_ID"

/**
 * Reads the `rememberMe` cookie from the environment. This is the only
 * accepted authentication method: the user copies the value of the
 * `rememberMe` cookie from a logged-in browser session into the
 * `CG_REMEMBER_ME` environment variable (see `.env.example`).
 */
export function getRememberMeCookie(): string {
  const cookie = process.env[REMEMBER_ME_ENV]
  if (!cookie) {
    throw new Error(
      `Missing CodinGame authentication. Set the "${REMEMBER_ME_ENV}" environment variable ` +
        `to the value of your "rememberMe" cookie (copied from a logged-in browser session).`
    )
  }
  return cookie
}

/**
 * Resolves the current user's numeric id. The CodinGame `rememberMe` cookie is
 * prefixed by the user id, so we derive it from the cookie (same approach as
 * the takos22/codingame library). It can be overridden with `CG_USER_ID` when
 * the heuristic does not match.
 */
export function getMyUserId(): number {
  const override = process.env[USER_ID_ENV]
  if (override) {
    const parsed = parseInt(override, 10)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  const cookie = getRememberMeCookie()
  const leadingDigits = cookie.match(/^\d+/)?.[0]
  const id = leadingDigits ? parseInt(leadingDigits, 10) : NaN
  if (Number.isNaN(id)) {
    throw new Error(
      `Could not derive your user id from the rememberMe cookie. ` +
        `Set the "${USER_ID_ENV}" environment variable to your CodinGame user id.`
    )
  }
  return id
}

const isDebug = () => process.env.CG_DEBUG === "1" || process.env.CG_DEBUG === "true"

/**
 * Performs a POST request against a CodinGame service. The CodinGame API maps
 * to `POST https://www.codingame.com/services/<Service>/<func>` with the
 * parameters passed as a JSON array body. Authentication is carried by the
 * `rememberMe` cookie.
 */
export async function cgRequest<T = unknown>(
  service: string,
  func: string,
  parameters: unknown[] = []
): Promise<T> {
  const url = `${BASE_URL}${service}/${func}`
  const body = JSON.stringify(parameters)

  if (isDebug()) {
    console.log(chalk.gray(`→ POST ${service}/${func} ${body}`))
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      Cookie: `rememberMe=${getRememberMeCookie()}`,
    },
    body,
  })

  const text = await response.text()
  let parsed: unknown
  try {
    parsed = text.length > 0 ? JSON.parse(text) : null
  } catch {
    throw new Error(`CodinGame ${service}/${func} returned a non-JSON response (HTTP ${response.status})`)
  }

  if (isDebug()) {
    console.log(chalk.gray(`← ${response.status} ${JSON.stringify(parsed)?.slice(0, 2000)}`))
  }

  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "message" in parsed
        ? (parsed as { message: string }).message
        : `HTTP ${response.status}`
    throw new Error(`CodinGame ${service}/${func} failed: ${message}`)
  }

  return parsed as T
}
