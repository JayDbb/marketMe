export default function DataDeletionPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold mb-6">
                MarketMe User Data Deletion
            </h1>

            <p className="mb-6 text-gray-700">
                MarketMe respects your privacy and gives you full control over your
                personal data. If you wish to permanently delete your account and all
                associated information, you may request deletion using one of the
                methods below.
            </p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">
                    Request Account Deletion
                </h2>

                <ol className="list-decimal ml-6 space-y-3">
                    <li>
                        Sign in to your MarketMe account.
                    </li>

                    <li>
                        Navigate to <strong>Settings → Account</strong>.
                    </li>

                    <li>
                        Select <strong>Delete Account</strong> and confirm your request.
                    </li>

                    <li>
                        If you cannot access your account, email us at{" "}
                        <a
                            href="mailto:tristanthomp.876@gmail.com"
                            className="text-blue-600 underline"
                        >
                            tristanthomp.876@gmail.com
                        </a>{" "}
                        with the subject line:
                    </li>
                </ol>

                <div className="bg-gray-100 rounded-lg p-4 mt-4 font-mono">
                    Delete My MarketMe Account
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">
                    What Information Will Be Deleted?
                </h2>

                <p className="mb-4">
                    Once your request has been verified and processed, MarketMe will
                    permanently delete the following information associated with your
                    account:
                </p>

                <ul className="list-disc ml-6 space-y-2">
                    <li>User profile information</li>
                    <li>Business profiles</li>
                    <li>Connected Facebook and Instagram accounts</li>
                    <li>Marketing strategies</li>
                    <li>Content calendars</li>
                    <li>Generated social media posts</li>
                    <li>Creative briefs</li>
                    <li>AI-generated images and uploaded media</li>
                    <li>Scheduling history</li>
                    <li>Analytics and engagement records linked to your account</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">
                    Processing Time
                </h2>

                <p>
                    Verified deletion requests are normally completed within
                    <strong> 30 days</strong>. Once deletion has been completed, your data
                    cannot be recovered.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-3">
                    Contact Us
                </h2>

                <p>
                    If you have any questions regarding your personal data or this
                    deletion process, please contact us at{" "}
                    <a
                        href="mailto:tristanthomp.876@gmail.com"
                        className="text-blue-600 underline"
                    >
                        tristanthomp.876@gmail.com
                    </a>.
                </p>
            </section>
        </main>
    );
}