package net.iriscan.reactnative.sdk

import android.graphics.BitmapFactory
import android.util.Base64
import com.facebook.react.bridge.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import net.iriscan.sdk.BiometricSdkFactory
import net.iriscan.sdk.core.io.HashMethod
import net.iriscan.sdk.face.*

class BiometricSdkReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun configure(config: ReadableMap, promise: Promise) {
    CoroutineScope(Dispatchers.IO).launch {
      try {
        var configBuilder = BiometricSdkFactory.configBuilder()
          .withContext(reactApplicationContext)
        if (config.hasKey("withFace")) {
          val encoderFaceNetConfig = config.getMap("withFace")!!.getMap("encoder")!!.getMap("tfModel")!!
          val matcherConfig = config.getMap("withFace")!!.getMap("matcher")!!
          val modelChecksum = encoderFaceNetConfig.getString("modelChecksum")
          val encoderProperties = FaceEncodeProperties(
            tfModel = FaceNetModelConfiguration(
              path = encoderFaceNetConfig.getString("path")!!,
              inputHeight = encoderFaceNetConfig.getInt("inputHeight"),
              inputWidth = encoderFaceNetConfig.getInt("inputWidth"),
              outputLength = encoderFaceNetConfig.getInt("outputLength"),
              modelChecksum = modelChecksum,
              modelChecksumMethod = if (modelChecksum != null) HashMethod.SHA256 else null,
              overrideCacheOnWrongChecksum = true
            )
          )
          var livenessPriperties: FaceLivenessDetectionProperties? = null
          val livenessConfig = config.getMap("withFace")!!.getMap("liveness")?.getMap("tfModel")
          if (livenessConfig != null) {
            val livenessModelChecksum = livenessConfig.getString("modelChecksum")
            livenessPriperties = FaceLivenessDetectionProperties(
              tfModel = LivenessModelConfiguration(
                path = livenessConfig.getString("path")!!,
                inputHeight = livenessConfig.getInt("inputHeight"),
                inputWidth = livenessConfig.getInt("inputWidth"),
                threshold = livenessConfig.getDouble("threshold"),
                modelChecksum = livenessModelChecksum,
                modelChecksumMethod = if (livenessModelChecksum != null) HashMethod.SHA256 else null,
                overrideCacheOnWrongChecksum = true
              )
            )
          }
          configBuilder = configBuilder
            .withFace(
              extractor = FaceExtractProperties(),
              encoder = encoderProperties,
              matcher = FaceMatchProperties(threshold = matcherConfig.getDouble("threshold")),
              liveness = livenessPriperties
            )
        }
        BiometricSdkFactory.initialize(config = configBuilder.build())
        promise.resolve(null)
      } catch (ex: Exception) {
        promise.reject(ex)
      }
    }
  }

  @ReactMethod
  fun faceExtractAndEncode(b64Img: String, promise: Promise) {
    val instance = BiometricSdkFactory.getInstance()!!
    val imageData = Base64.decode(b64Img, Base64.DEFAULT)
    val bitmap = BitmapFactory.decodeByteArray(imageData, 0, imageData.size)
    val template = instance.face().encoder().extractAndEncode(bitmap)
    if (template != null) {
      val templateStr = Base64.encodeToString(template, Base64.DEFAULT)
      promise.resolve(templateStr)
    } else {
      promise.reject("FACE_EXTRACT_ERROR", "No biometrics were found on image")
    }
  }

  @ReactMethod
  fun faceCompare(b64Template1: String, b64Template2: String, promise: Promise) {
    val instance = BiometricSdkFactory.getInstance()!!
    val template1 = Base64.decode(b64Template1, Base64.DEFAULT)
    val template2 = Base64.decode(b64Template2, Base64.DEFAULT)
    val match = instance.face().matcher().matches(template1, template2)
    promise.resolve(match)
  }

  @ReactMethod
  fun faceScore(b64Template1: String, b64Template2: String, promise: Promise) {
    val instance = BiometricSdkFactory.getInstance()!!
    val template1 = Base64.decode(b64Template1, Base64.DEFAULT)
    val template2 = Base64.decode(b64Template2, Base64.DEFAULT)
    val score = instance.face().matcher().matchScore(template1, template2)
    promise.resolve(score)
  }

  @ReactMethod
  fun livenessValidate(b64Img: String, promise: Promise) {
    val instance = BiometricSdkFactory.getInstance()!!
    val imageData = Base64.decode(b64Img, Base64.DEFAULT)
    val bitmap = BitmapFactory.decodeByteArray(imageData, 0, imageData.size)
    val result = instance.face().liveness().extractAndValidate(bitmap)
    promise.resolve(result)
  }

  @ReactMethod
  fun livenessScore(b64Img: String, promise: Promise) {
    val instance = BiometricSdkFactory.getInstance()!!
    val imageData = Base64.decode(b64Img, Base64.DEFAULT)
    val bitmap = BitmapFactory.decodeByteArray(imageData, 0, imageData.size)
    val score = instance.face().liveness().extractAndScore(bitmap)
    promise.resolve(score)
  }

  companion object {
    const val NAME = "BiometricSdkReactNative"
  }
}
