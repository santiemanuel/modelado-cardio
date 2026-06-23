import { careMosaicItems } from "./landingContent";

export function CareMosaicSection() {
  return (
    <section className="mosaic-section" id="cuidado" aria-labelledby="mosaic-title">
      <div className="section-heading-centered">
        <p className="section-kicker">Lectura cardiometabólica</p>
        <h2 id="mosaic-title">Del dato aislado a una decisión más clara</h2>
      </div>
      <div className="care-mosaic">
        {careMosaicItems.map((item) =>
          item.type === "image" ? (
            <figure className={item.className} key={item.caption}>
              <img src={item.image} alt={item.alt} />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ) : (
            <article className={item.className} key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ),
        )}
      </div>
    </section>
  );
}
