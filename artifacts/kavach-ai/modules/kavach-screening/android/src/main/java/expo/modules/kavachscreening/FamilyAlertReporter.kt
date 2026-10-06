package expo.modules.kavachscreening

import android.content.Context
import android.util.Log
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

/**
 * Family Guardian: tells the Netraksh API that this phone is receiving a call so
 * the server can alert the family members this user agreed to share alerts
 * with. Runs only after the user accepted a Family Guardian invite (the flag is
 * synced from JS). The server looks up the caller's reputation itself and only
 * notifies anyone when the number has been reported as a scam, so this never
 * relies on an on-device verdict.
 */
object FamilyAlertReporter {
  private const val TAG = "KavachFamilyAlert"

  fun reportIncomingCall(ctx: Context, number: String) {
    if (!ScreeningStore.isFamilyAlertsEnabled(ctx)) return
    val base = ScreeningStore.getApiBaseUrl(ctx)
    val token = ScreeningStore.getAuthToken(ctx)
    if (base.isEmpty() || token.isEmpty()) return

    // The screening service must answer quickly, so the request goes on its own
    // thread and failures are only logged.
    Thread {
      var conn: HttpURLConnection? = null
      try {
        conn = (URL("$base/api/family/alerts").openConnection() as HttpURLConnection).apply {
          requestMethod = "POST"
          connectTimeout = 5_000
          readTimeout = 8_000
          doOutput = true
          setRequestProperty("Content-Type", "application/json")
          setRequestProperty("Authorization", "Bearer $token")
        }
        val body = JSONObject().put("callerPhone", number).toString()
        conn.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
        val code = conn.responseCode
        if (code !in 200..299) Log.w(TAG, "Family alert request failed: HTTP $code")
      } catch (e: Exception) {
        Log.w(TAG, "Family alert request failed", e)
      } finally {
        conn?.disconnect()
      }
    }.start()
  }
}
