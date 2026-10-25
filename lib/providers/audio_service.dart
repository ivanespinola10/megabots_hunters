import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

class AudioService extends ChangeNotifier {
  final AudioPlayer _bgmPlayer = AudioPlayer();
  final AudioPlayer _sfxPlayer = AudioPlayer();

  bool isMuted = false;

  void toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      _bgmPlayer.pause();
    } else {
      _bgmPlayer.resume();
    }
    notifyListeners();
  }

  Future<void> playBgm(String assetName) async {
    if (isMuted) return;
    try {
      _bgmPlayer.setReleaseMode(ReleaseMode.loop);
      
      // NOTA: Descomenta esto cuando tengas los archivos MP3 reales en la carpeta assets/audio/
      // await _bgmPlayer.play(AssetSource('audio/$assetName'));
      
      if (kDebugMode) {
        print('🎧 [AudioService] Reproduciendo BGM: $assetName');
      }
    } catch (e) {
      if (kDebugMode) print('Error BGM: $e');
    }
  }

  Future<void> stopBgm() async {
    await _bgmPlayer.stop();
  }

  Future<void> playSfx(String assetName) async {
    if (isMuted) return;
    try {
      // NOTA: Descomenta esto cuando tengas los archivos MP3 reales en la carpeta assets/audio/
      // await _sfxPlayer.play(AssetSource('audio/$assetName'));
      
      if (kDebugMode) {
        print('💥 [AudioService] Efecto de sonido: $assetName');
      }
    } catch (e) {
      if (kDebugMode) print('Error SFX: $e');
    }
  }
}
