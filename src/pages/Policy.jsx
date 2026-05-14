import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants/contactInfo.js';
import '../styles/homepage.css';
import '../styles/policy.css';

const LAST_UPDATED = '13 maja 2026';

const POLICIES = {
  privacy: {
    eyebrow: 'Prywatność',
    title: 'Polityka prywatności',
    intro:
      'Ta polityka wyjaśnia, jak Destination Paradise przetwarza dane, które przekazujesz przy zapytaniach, rezerwacjach i kontakcie z naszym zespołem.',
    sections: [
      {
        title: 'Jakie informacje zbieramy',
        items: [
          'Dane kontaktowe, takie jak imię i nazwisko, adres e-mail, numer telefonu, WhatsApp i kraj.',
          'Szczegóły podróży, takie jak preferowane daty, liczba osób, budżet, zainteresowania, hotel lub miejsce odbioru oraz prośby specjalne.',
          'Wiadomości wysyłane przez formularze, WhatsApp, e-mail lub kanały społecznościowe.',
          'Podstawowe informacje techniczne, takie jak typ przeglądarki, urządzenie, odwiedzane strony i przybliżona lokalizacja z narzędzi analitycznych.',
        ],
      },
      {
        title: 'Jak wykorzystujemy informacje',
        items: [
          'Aby odpowiadać na zapytania i przygotowywać propozycje podróży, wyceny, rezerwacje oraz plany.',
          'Aby koordynować przewodników, kierowców, partnerów hotelowych, operatorów łodzi, dostawców safari i innych partnerów potrzebnych do podróży.',
          'Aby ulepszać stronę, obsługę klienta, pakiety, wycieczki i doświadczenie planowania safari.',
          'Aby wysyłać aktualizacje rezerwacji, wiadomości serwisowe i informacje powiązane z Twoim zapytaniem.',
        ],
      },
      {
        title: 'Udostępnianie informacji',
        items: [
          'Udostępniamy tylko te dane, które są potrzebne do organizacji podróży, zaufanym lokalnym partnerom, operatorom płatności lub dostawcom usług.',
          'Możemy udostępnić informacje, gdy wymagają tego przepisy prawa, bezpieczeństwo, procedury graniczne lub oficjalne procedury podróży.',
          'Nie sprzedajemy Twoich danych osobowych.',
        ],
      },
      {
        title: 'Twoje wybory',
        items: [
          'Możesz poprosić o poprawienie, aktualizację lub usunięcie danych osobowych, gdy nie są już potrzebne do rezerwacji, rozliczeń, bezpieczeństwa lub obowiązków prawnych.',
          'Możesz nie podawać danych opcjonalnych, choć może to ograniczyć precyzję planowania podróży.',
          'Możesz w każdej chwili zrezygnować z wiadomości marketingowych, kontaktując się z nami.',
        ],
      },
    ],
  },
  terms: {
    eyebrow: 'Warunki',
    title: 'Regulamin usług',
    intro:
      'Ten regulamin opisuje, jak działają zapytania, rezerwacje, płatności, zmiany i odpowiedzialność podróżna przy korzystaniu z usług Destination Paradise.',
    sections: [
      {
        title: 'Korzystanie ze strony',
        items: [
          'Strona pomaga poznawać wyjazdy na Zanzibar i do Tanzanii, wysyłać zapytania o wycenę oraz kontaktować się z zespołem.',
          'Treści, ceny, trasy, dostępność i zakres usług mogą się zmieniać wraz z dostawcami, sezonem, zasadami parków, kosztami paliwa i pogodą.',
          'Zgadzasz się nie nadużywać strony, nie wysyłać fałszywych zapytań i nie zakłócać jej działania.',
        ],
      },
      {
        title: 'Wyceny i rezerwacje',
        items: [
          'Rezerwacja jest potwierdzona dopiero po sprawdzeniu dostępności, uzgodnieniu finalnego planu i otrzymaniu wymaganej płatności lub zaliczki.',
          'Wycena wyjaśnia, co jest w cenie, co nie jest w cenie, terminy płatności, zasady anulacji i ważne warunki dostawców.',
          'Przed potwierdzeniem odpowiadasz za sprawdzenie nazwisk, dat, miejsca odbioru, danych paszportowych, potrzeb dietetycznych, kwestii medycznych i dokumentów podróży.',
        ],
      },
      {
        title: 'Zmiany, anulacje i zwroty',
        items: [
          'Zasady zmian i anulacji zależą od konkretnego hotelu, parku, linii lotniczej, łodzi, przewodnika lub zewnętrznego dostawcy użytego w planie.',
          'Zwroty, zwroty częściowe lub kredyty są realizowane zgodnie z pisemnymi warunkami przekazanymi przy potwierdzeniu rezerwacji.',
          'Pogoda, stan morza, dostęp do parków, stan dróg, zasady rządowe lub względy bezpieczeństwa mogą wymagać zmiany czasu, trasy, dostawcy albo kolejności aktywności.',
        ],
      },
      {
        title: 'Odpowiedzialność podróżna',
        items: [
          'Podróż zawsze wiąże się z pewnym ryzykiem. Odpowiadasz za odpowiednie ubezpieczenie, zalecenia zdrowotne, wizy, paszporty i rzeczy osobiste.',
          'Starannie współpracujemy z lokalnymi partnerami, ale nie odpowiadamy za opóźnienia lub straty spowodowane zdarzeniami poza naszą rozsądną kontrolą.',
          'Jeśli coś pójdzie nie tak w trakcie podróży, skontaktuj się z nami szybko, abyśmy mogli pomóc, gdy nadal jest czas na działanie.',
        ],
      },
    ],
  },
  cookies: {
    eyebrow: 'Cookie',
    title: 'Polityka cookie',
    intro:
      'Ta polityka wyjaśnia, jak pliki cookie i podobne technologie mogą być używane, aby strona działała, rozumieć odwiedziny i ulepszać planowanie podróży.',
    sections: [
      {
        title: 'Czym są cookie',
        items: [
          'Cookie to małe pliki zapisywane na urządzeniu podczas odwiedzania strony.',
          'Podobne technologie, takie jak local storage, piksele i tagi analityczne, mogą pomagać zapamiętywać ustawienia lub mierzyć użycie stron.',
        ],
      },
      {
        title: 'Jak używamy cookie',
        items: [
          'Niezbędne cookie i zapis lokalny pomagają stronie się ładować, zapamiętywać motyw, obsługiwać formularze i działać stabilnie.',
          'Cookie analityczne mogą pomagać nam rozumieć, które strony są przydatne, skąd trafiają odwiedzający i jak możemy ulepszyć stronę.',
          'Narzędzia marketingowe lub społecznościowe mogą być używane, gdy korzystasz z osadzonych treści, linków społecznościowych lub linków kampanii.',
        ],
      },
      {
        title: 'Zarządzanie cookie',
        items: [
          'Możesz blokować, usuwać lub ograniczać cookie w ustawieniach przeglądarki.',
          'Niektóre funkcje mogą nie działać poprawnie, jeśli wyłączysz niezbędne cookie lub local storage.',
          'Usługi zewnętrzne mogą udostępniać własne ustawienia prywatności i cookie na swoich stronach lub w kontach użytkownika.',
        ],
      },
      {
        title: 'Aktualizacje',
        items: [
          'Możemy aktualizować tę politykę, gdy zmienią się narzędzia strony, konfiguracja analityki lub proces rezerwacji.',
          'Najnowsza wersja będzie opublikowana na tej stronie z datą aktualizacji.',
        ],
      },
    ],
  },
};

function PolicySection({ title, items }) {
  return (
    <section className="policy-section">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default function Policy({ section = 'privacy' }) {
  const policy = POLICIES[section] || POLICIES.privacy;

  useEffect(() => {
    document.title = `${policy.title} · Destination Paradise`;
  }, [policy.title]);

  return (
    <main className="policy-page">
      <section className="policy-hero">
        <div className="policy-hero__inner">
          <span className="section-eyebrow">{policy.eyebrow}</span>
          <h1>{policy.title}</h1>
          <p>{policy.intro}</p>
          <dl className="policy-meta" aria-label="Szczegóły polityki">
            <div>
              <dt>Ostatnia aktualizacja</dt>
              <dd>{LAST_UPDATED}</dd>
            </div>
            <div>
              <dt>Kontakt</dt>
              <dd><a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="policy-content" aria-label={policy.title}>
        {policy.sections.map((item) => (
          <PolicySection key={item.title} title={item.title} items={item.items} />
        ))}

        <section className="policy-section policy-section--contact">
          <h2>Kontakt</h2>
          <p>
            Jeśli masz pytania o tę politykę lub szczegóły rezerwacji, napisz do Destination Paradise na{' '}
            <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a> albo skontaktuj się przez WhatsApp.
          </p>
          <div className="policy-actions">
            <a className="btn" href={`mailto:${CONTACT_INFO.email}`}>Napisz e-mail</a>
            <Link className="btn btn--ghost" to="/trip-planner">Zaplanuj podróż</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
