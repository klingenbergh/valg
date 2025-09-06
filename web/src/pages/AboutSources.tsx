export default function AboutSources() {
  return (
    <div className="container py-6 space-y-4">
      <h1 className="text-2xl font-semibold">About & Sources</h1>
      <p>
        This app aggregates official election results from SSB StatBank and Valgdirektoratet, and
        opinion polls from Wikipedia. Each datapoint includes metadata and is cached locally.
      </p>
      <ul className="list-disc pl-6">
        <li>SSB PxWeb API – see StatBank documentation</li>
        <li>Valgdirektoratet – valgresultat.no API</li>
        <li>Wikipedia – Opinion polling pages per election year</li>
      </ul>
    </div>
  );
}
