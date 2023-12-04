import Foundation
import BiometricSdk

@objc(BiometricSdkReactNative)
class BiometricSdkReactNative: NSObject {

    @objc
    func configure(_ configuration: NSDictionary,
                   resolve:  @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) -> Void {
        NSLog("Initializing Biometric SDK with config: %@", dump(configuration))
        DispatchQueue.global(qos: .default).async {
            do {
                var builder = BiometricSdkConfigBuilder()
                if (configuration.value(forKey: "withFace") != nil) {
                    let faceModelPath = configuration.value(forKeyPath: "withFace.encoder.tfModel.path") as! String
                    let faceModelChecksum = configuration.value(forKeyPath: "withFace.encoder.tfModel.modelChecksum") as? String
                    let faceModelinputWidth = configuration.value(forKeyPath: "withFace.encoder.tfModel.inputWidth") as! Int32
                    let faceModelinputHeight = configuration.value(forKeyPath: "withFace.encoder.tfModel.inputHeight") as! Int32
                    let faceModeloutputLenghth = configuration.value(forKeyPath: "withFace.encoder.tfModel.outputLength") as! Int32
                    let faceMatcherThreshold = configuration.value(forKeyPath: "withFace.matcher.threshold") as! Double
                    let encoderProperties = FaceEncodeProperties(
                        tfModel:
                            FaceNetModelConfiguration(
                                path: faceModelPath,
                                inputWidth:  faceModelinputWidth,
                                inputHeight: faceModelinputHeight,
                                outputLength: faceModeloutputLenghth,
                                modelChecksum: faceModelChecksum,
                                modelChecksumMethod: faceModelChecksum != nil ? HashMethod.sha256 : nil,
                                overrideCacheOnWrongChecksum: faceModelChecksum != nil ? true : nil
                            )
                    )
                    var livenessProperties: FaceLivenessDetectionProperties? = nil
                    if (configuration.value(forKeyPath: "withFace.liveness") != nil) {
                        let livenessModelPath = configuration.value(forKeyPath: "withFace.liveness.tfModel.path") as! String
                        let livenessModelChecksum = configuration.value(forKeyPath: "withFace.liveness.tfModel.modelChecksum") as? String
                        let livenessModelinputWidth = configuration.value(forKeyPath: "withFace.liveness.tfModel.inputWidth") as! Int32
                        let livenessModelinputHeight = configuration.value(forKeyPath: "withFace.liveness.tfModel.inputHeight") as! Int32
                        let livenessModelthreshold = configuration.value(forKeyPath: "withFace.liveness.tfModel.threshold") as! Double
                        livenessProperties = FaceLivenessDetectionProperties(
                            tfModel: LivenessModelConfiguration(
                                path: livenessModelPath,
                                inputWidth: livenessModelinputWidth,
                                inputHeight: livenessModelinputHeight,
                                threshold: livenessModelthreshold,
                                modelChecksum: livenessModelChecksum,
                                modelChecksumMethod: livenessModelChecksum != nil ? HashMethod.sha256 : nil,
                                overrideCacheOnWrongChecksum: livenessModelChecksum != nil ? true : nil)
                        )
                    }
                    builder = builder
                        .withFace(extractor: FaceExtractProperties(),
                                  encoder: encoderProperties,
                                  matcher: FaceMatchProperties(threshold: faceMatcherThreshold),
                                  liveness: livenessProperties)
                }
                try BiometricSdkFactory.shared.initialize(config: builder.build())
                resolve(nil)
            } catch {
                reject("BIOMETRIC_SDK_CONFIG_ERROR", error.localizedDescription, error)
            }
        }
    }

    @objc
    func faceExtractAndEncode(_ b64Img: NSString,
                              resolve:  @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) -> Void {
        let instance = BiometricSdkFactory.shared.getInstance()!
        let imageData = Data(base64Encoded: b64Img as String)!
        let img = UIImage(data: imageData)!
        let cgImagePtr = UnsafeMutableRawPointer(Unmanaged.passRetained(img.cgImage!).toOpaque())
        let template = instance.face().encoder().extractAndEncode(nativeImage: cgImagePtr)
        if (template != nil) {
            let templateStr = template!.base64EncodedString() as NSString
            resolve(templateStr)
        } else {
            reject("FACE_EXTRACT_ERROR", "No biometrics were found on image", nil)
        }
    }

    @objc
    func faceCompare(_ b64Template1: NSString,
                     b64Template2: NSString,
                     resolve:  @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) -> Void {
        let instance = BiometricSdkFactory.shared.getInstance()!
        let sample1 = Data(base64Encoded: b64Template1 as String)!
        let sample2 = Data(base64Encoded: b64Template2 as String)!
        resolve(instance.face().matcher().matches(sample1: sample1, sample2: sample2))
    }

    @objc
    func faceScore(_ b64Template1: NSString,
                   b64Template2: NSString,
                   resolve:  @escaping RCTPromiseResolveBlock,
                   reject: @escaping RCTPromiseRejectBlock) -> Void {
        let instance = BiometricSdkFactory.shared.getInstance()!
        let sample1 = Data(base64Encoded: b64Template1 as String)!
        let sample2 = Data(base64Encoded: b64Template2 as String)!
        resolve(instance.face().matcher().matchScore(sample1: sample1, sample2: sample2))
    }

    @objc
    func livenessScore(_ b64Img: NSString,
                       resolve:  @escaping RCTPromiseResolveBlock,
                       reject: @escaping RCTPromiseRejectBlock) -> Void {
        let imageData = Data(base64Encoded: b64Img as String)!
        let img = UIImage(data: imageData)!
        let cgImagePtr = UnsafeMutableRawPointer(Unmanaged.passRetained(img.cgImage!).toOpaque())
        let instance = BiometricSdkFactory.shared.getInstance()!
        resolve(instance.face().liveness().extractAndScore(nativeImage: cgImagePtr))
    }

    @objc
    func livenessValidate(_ b64Img: NSString,
                          resolve:  @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) -> Void {
        let imageData = Data(base64Encoded: b64Img as String)!
        let img = UIImage(data: imageData)!
        let cgImagePtr = UnsafeMutableRawPointer(Unmanaged.passRetained(img.cgImage!).toOpaque())
        let instance = BiometricSdkFactory.shared.getInstance()!
        resolve(instance.face().liveness().extractAndValidate(nativeImage: cgImagePtr))
    }
}
