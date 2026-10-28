/** Navy banner with the page's single <h1>. */
export function PageHeader({ title, subtitle }) {
  return (
    <div className="bg-primary-900 text-white">
      <div className="container-page py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <div className="mt-3 h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
        {subtitle ? <p className="mt-4 max-w-2xl text-base text-primary-100 sm:text-lg">{subtitle}</p> : null}
      </div>
    </div>
  );
}
