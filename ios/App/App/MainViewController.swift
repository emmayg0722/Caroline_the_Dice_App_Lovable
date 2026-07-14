import UIKit
import Capacitor

/// Custom bridge view controller that removes the bar at the top of the page.
///
/// The bar was the WKWebView scroll-view background showing in the safe-area
/// inset strip (`contentInset` used to be "always"). We now let the web view
/// run edge-to-edge (contentInset "never" in capacitor.config) and paint it
/// with the app's cream base color so no white/black strip can appear, and we
/// disable scroll bounce so the page always snaps back to position.
class MainViewController: CAPBridgeViewController {
    // App base color (#FFF8E8).
    private let baseColor = UIColor(red: 1.0, green: 248.0 / 255.0, blue: 232.0 / 255.0, alpha: 1.0)

    override func viewDidLoad() {
        super.viewDidLoad()
        configureWebView()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        configureWebView()
    }

    private func configureWebView() {
        view.backgroundColor = baseColor
        guard let webView = webView else { return }
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        webView.scrollView.alwaysBounceHorizontal = false
        webView.isOpaque = true
        webView.backgroundColor = baseColor
        webView.scrollView.backgroundColor = baseColor
    }
}
