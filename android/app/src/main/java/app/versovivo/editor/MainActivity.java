package app.versovivo.editor;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

/**
 * Android 15+ (target 35/36) desenha edge-to-edge à força. A WebView não conhece as barras do sistema,
 * então aplicamos os insets (barras, recorte da câmera e teclado) como padding da raiz.
 */
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        final View root = findViewById(android.R.id.content);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
            return WindowInsetsCompat.CONSUMED;
        });
        WindowInsetsControllerCompat c = new WindowInsetsControllerCompat(getWindow(), root);
        c.setAppearanceLightStatusBars(false);      // app escuro: ícones claros
        c.setAppearanceLightNavigationBars(false);

        // Android 16 / target 36: Voltar preditivo não chama onBackPressed(). Encaminha ao histórico da WebView
        // (o app empilha uma entrada enquanto o editor está aberto); sem histórico, manda o app para segundo plano (padrão do Android).
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView wv = getBridge() != null ? getBridge().getWebView() : null;
                if (wv != null && wv.canGoBack()) {
                    wv.goBack();
                } else {
                    moveTaskToBack(true); // padrão do Android para a atividade raiz: sai do app mantendo o estado
                }
            }
        });
    }
}
