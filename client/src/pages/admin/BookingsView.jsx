import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RotateCcw,
  SearchX,
  UserRound,
  XCircle,
} from 'lucide-react';
import './view/BookingView.css'
import {
  BackLink,
  EmptyState,
  FilterTabs,
  SearchBox,
  StatusBadge,
} from './AdminUi.jsx';
import {
  formatDate,
  includesSearch,
  normalizeSearch,
  statusLabel,
} from './AdminUtils.js';

const WEEK_DAYS = ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('bg-BG', {
  month: 'long',
  year: 'numeric',
});

const STATUS_OPTIONS = [
  { value: 'new', label: 'Нова' },
  { value: 'reviewed', label: 'Прегледана' },
  { value: 'confirmed', label: 'Потвърдена' },
  { value: 'completed', label: 'Завършена' },
  { value: 'cancelled', label: 'Отказана' },
];

function startOfDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value) {
  const date = startOfDay(value);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBookingDate(booking) {
  return (
    booking?.preferred?.date ||
    booking?.scheduledAt ||
    booking?.appointmentAt ||
    booking?.createdAt ||
    ''
  );
}

function getBookingTime(booking) {
  const explicitTime =
    booking?.preferred?.time ||
    booking?.preferred?.timeSlot ||
    booking?.preferred?.hour ||
    '';

  if (explicitTime) return String(explicitTime);

  const rawDate = booking?.preferred?.date || booking?.scheduledAt || booking?.appointmentAt;
  if (!rawDate) return '';

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '';

  if (date.getHours() === 0 && date.getMinutes() === 0) return '';

  return new Intl.DateTimeFormat('bg-BG', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getClientName(booking) {
  return booking?.client?.name || 'Клиент без име';
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

function shiftMonth(value, amount) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function isUpcoming(booking) {
  const date = startOfDay(getBookingDate(booking));
  const today = startOfDay(new Date());
  if (!date || !today) return false;

  return (
    date >= today &&
    !['completed', 'cancelled'].includes(booking?.status)
  );
}

function bookingMatchesFilter(booking, filter) {
  if (filter === 'all') return true;
  if (filter === 'attention') return ['new', 'reviewed'].includes(booking.status);
  if (filter === 'upcoming') return isUpcoming(booking);
  return booking.status === filter;
}

function CalendarEvent({ booking, onOpen }) {
  const time = getBookingTime(booking);

  return (
    <button
      className={`dAdminCalendarEvent dAdminCalendarEvent--${booking.status || 'new'}`}
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onOpen(booking.id);
      }}
      title={`${getClientName(booking)} · ${statusLabel(booking.status)}`}
    >
      <span>{time || 'Заявка'}</span>
      <strong>{getClientName(booking)}</strong>
    </button>
  );
}

function BookingCalendar({ bookings, month, onMonthChange, selectedDay, onDaySelect, onOpen }) {
  const days = useMemo(() => getCalendarDays(month), [month]);
  const todayKey = dateKey(new Date());
  const selectedKey = dateKey(selectedDay);
  const activeMonth = month.getMonth();

  const bookingsByDay = useMemo(() => {
    const map = new Map();

    bookings.forEach((booking) => {
      const key = dateKey(getBookingDate(booking));
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(booking);
    });

    map.forEach((items) => {
      items.sort((a, b) => {
        const first = new Date(getBookingDate(a)).getTime() || 0;
        const second = new Date(getBookingDate(b)).getTime() || 0;
        return first - second;
      });
    });

    return map;
  }, [bookings]);

  return (
    <section className="dAdminCalendarPanel">
      <header className="dAdminCalendarPanel__head">
        <div>
          <span className="dAdminEyebrow">Календар на консултациите</span>
          <h2>{MONTH_FORMATTER.format(month)}</h2>
          <p>Изберете ден или отворете заявка директно от календара.</p>
        </div>

        <div className="dAdminCalendarNav" aria-label="Управление на календара">
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            aria-label="Предишен месец"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="dAdminCalendarNav__today"
            type="button"
            onClick={() => {
              const today = new Date();
              onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));
              onDaySelect(today);
            }}
          >
            Днес
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            aria-label="Следващ месец"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      <div className="dAdminCalendarLegend" aria-label="Легенда на статусите">
        {STATUS_OPTIONS.map((item) => (
          <span key={item.value}>
            <i className={`is-${item.value}`} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="dAdminCalendar" role="grid" aria-label="Месечен календар">
        {WEEK_DAYS.map((day) => (
          <div className="dAdminCalendar__weekday" key={day} role="columnheader">
            {day}
          </div>
        ))}

        {days.map((day) => {
          const key = dateKey(day);
          const dayBookings = bookingsByDay.get(key) || [];
          const isOutside = day.getMonth() !== activeMonth;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const visibleBookings = dayBookings.slice(0, 3);
          const hiddenCount = dayBookings.length - visibleBookings.length;

          return (
            <button
              className={[
                'dAdminCalendarDay',
                isOutside ? 'is-outside' : '',
                isToday ? 'is-today' : '',
                isSelected ? 'is-selected' : '',
              ].filter(Boolean).join(' ')}
              key={key}
              type="button"
              onClick={() => onDaySelect(day)}
              role="gridcell"
              aria-label={`${day.getDate()} ${MONTH_FORMATTER.format(day)}, ${dayBookings.length} заявки`}
            >
              <span className="dAdminCalendarDay__number">{day.getDate()}</span>

              <div className="dAdminCalendarDay__events">
                {visibleBookings.map((booking) => (
                  <CalendarEvent key={booking.id} booking={booking} onOpen={onOpen} />
                ))}

                {hiddenCount > 0 && (
                  <span className="dAdminCalendarDay__more">+{hiddenCount} още</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ManagementMetric({ icon: Icon, label, value, tone = 'neutral', onClick }) {
  return (
    <button
      className={`dAdminBookingMetric dAdminBookingMetric--${tone}`}
      type="button"
      onClick={onClick}
    >
      <span><Icon size={18} /></span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
      <ArrowRight size={16} />
    </button>
  );
}

function BookingRow({ booking, onOpen, onStatusChange, saving }) {
  const date = getBookingDate(booking);
  const time = getBookingTime(booking);

  return (
    <article className="dAdminBookingRow">
      <button
        className="dAdminBookingRow__main"
        type="button"
        onClick={() => onOpen(booking.id)}
      >
        <span className="dAdminBookingRow__avatar">
          <UserRound size={18} />
        </span>

        <span className="dAdminBookingRow__client">
          <strong>{getClientName(booking)}</strong>
          <small>
            {booking.client?.phone || booking.client?.email || 'Няма добавен контакт'}
          </small>
        </span>

        <span className="dAdminBookingRow__case">
          <strong>{booking.case?.area || 'Обща консултация'}</strong>
          <small>{booking.case?.urgency ? `${statusLabel(booking.case.urgency)} приоритет` : 'Нормален приоритет'}</small>
        </span>

        <span className="dAdminBookingRow__date">
          <strong>{date ? formatDate(date, false) : 'Без избрана дата'}</strong>
          <small>{time || booking.preferred?.contactMethod || 'Часът не е посочен'}</small>
        </span>
      </button>

      <div className="dAdminBookingRow__actions">
        <StatusBadge status={booking.status || 'new'} />
        <select
          value={booking.status || 'new'}
          onChange={(event) => onStatusChange(booking.id, event.target.value)}
          disabled={saving}
          aria-label={`Промяна на статус за ${getClientName(booking)}`}
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button type="button" onClick={() => onOpen(booking.id)}>
          Отвори
          <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

function BookingManagement({ bookings, selectedDay, onClearDay, onOpen, controller }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const query = normalizeSearch(search);
  const selectedKey = dateKey(selectedDay);

  const counts = useMemo(() => ({
    all: bookings.length,
    attention: bookings.filter((booking) => ['new', 'reviewed'].includes(booking.status)).length,
    upcoming: bookings.filter(isUpcoming).length,
    confirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    completed: bookings.filter((booking) => booking.status === 'completed').length,
    cancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
  }), [bookings]);

  const visibleBookings = useMemo(() => {
    return bookings
      .filter((booking) => !selectedKey || dateKey(getBookingDate(booking)) === selectedKey)
      .filter((booking) => bookingMatchesFilter(booking, filter))
      .filter((booking) => includesSearch(query, [
        booking.client?.name,
        booking.client?.phone,
        booking.client?.email,
        booking.case?.area,
        booking.case?.summary,
        booking.preferred?.contactMethod,
        booking.source,
        statusLabel(booking.status),
      ]))
      .sort((a, b) => {
        const first = new Date(getBookingDate(a)).getTime() || 0;
        const second = new Date(getBookingDate(b)).getTime() || 0;
        return first - second;
      });
  }, [bookings, filter, query, selectedKey]);

  const filters = [
    { value: 'all', label: 'Всички', count: counts.all },
    { value: 'attention', label: 'За реакция', count: counts.attention },
    { value: 'upcoming', label: 'Предстоящи', count: counts.upcoming },
    { value: 'confirmed', label: 'Потвърдени', count: counts.confirmed },
    { value: 'completed', label: 'Завършени', count: counts.completed },
    { value: 'cancelled', label: 'Отказани', count: counts.cancelled },
  ];

  return (
    <section className="dAdminBookingManagement">
      <div className="dAdminBookingManagement__metrics">
        <ManagementMetric
          icon={AlertCircle}
          label="За реакция"
          value={counts.attention}
          tone="warning"
          onClick={() => setFilter('attention')}
        />
        <ManagementMetric
          icon={CalendarCheck2}
          label="Предстоящи"
          value={counts.upcoming}
          tone="primary"
          onClick={() => setFilter('upcoming')}
        />
        <ManagementMetric
          icon={CheckCircle2}
          label="Потвърдени"
          value={counts.confirmed}
          tone="success"
          onClick={() => setFilter('confirmed')}
        />
        <ManagementMetric
          icon={XCircle}
          label="Отказани"
          value={counts.cancelled}
          tone="danger"
          onClick={() => setFilter('cancelled')}
        />
      </div>

      <div className="dAdminPanel dAdminBookingManagement__panel">
        <header className="dAdminBookingManagement__head">
          <div>
            <span className="dAdminEyebrow">Управление на заявките</span>
            <h3>
              {selectedDay
                ? `Заявки за ${formatDate(selectedDay, false)}`
                : 'Всички клиентски заявки'}
            </h3>
            <p>
              Променяйте статус, намирайте клиент и отваряйте пълния детайл без презареждане.
            </p>
          </div>

          {selectedDay && (
            <button className="dAdminClearDay" type="button" onClick={onClearDay}>
              <RotateCcw size={15} />
              Покажи всички дни
            </button>
          )}
        </header>

        <div className="dAdminBookingManagement__tools">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Клиент, телефон, имейл или област…"
            wide
          />
          <FilterTabs value={filter} onChange={setFilter} items={filters} />
        </div>

        <div className="dAdminBookingRows">
          {visibleBookings.length === 0 ? (
            <EmptyState
              icon={query ? SearchX : CalendarDays}
              title={query ? 'Няма съвпадащи заявки' : 'Няма заявки в този изглед'}
              text={query
                ? 'Променете търсенето или избрания филтър.'
                : 'Изберете друг ден или премахнете филтъра.'}
            />
          ) : (
            visibleBookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onOpen={onOpen}
                onStatusChange={controller.updateBookingStatus}
                saving={controller.saving}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function BookingContactAction({ href, icon: Icon, label, disabled = false }) {
  if (disabled) {
    return (
      <span className="dAdminBookingAction is-disabled">
        <Icon size={17} />
        {label}
      </span>
    );
  }

  return (
    <a className="dAdminBookingAction" href={href}>
      <Icon size={17} />
      {label}
    </a>
  );
}

function BookingDetail({ booking, goBack, controller }) {
  const { bookingNotes, setBookingNotes, addBookingNote, updateBookingStatus, saving } = controller;
  const noteValue = bookingNotes[booking.id] || '';
  const bookingDate = getBookingDate(booking);
  const bookingTime = getBookingTime(booking);

  async function handleAddNote() {
    await addBookingNote(booking.id);
  }

  return (
    <div className="dAdminView dAdminBookingDetailView">
      <section className="dAdminDetailHeader">
        <div>
          <BackLink onClick={goBack}>Назад към календара</BackLink>
          <span className="dAdminEyebrow">Клиентска заявка</span>
          <h2>{getClientName(booking)}</h2>
          <p>
            {booking.case?.area || 'Обща правна консултация'} · получена {formatDate(booking.createdAt)}
          </p>
        </div>

        <div className="dAdminDetailHeader__status">
          <StatusBadge status={booking.status || 'new'} />
          <select
            value={booking.status || 'new'}
            onChange={(event) => updateBookingStatus(booking.id, event.target.value)}
            disabled={saving}
            aria-label="Статус на заявката"
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="dAdminBookingDetailLayout">
        <main className="dAdminBookingDetailMain">
          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><FileText size={18} /></span>
                <div>
                  <small>Казус</small>
                  <h3>Информация за консултацията</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body">
              <div className="dAdminBookingInfoGrid">
                <div>
                  <span><MapPin size={15} /> Област</span>
                  <strong>{booking.case?.area || 'Не е посочена'}</strong>
                </div>
                <div>
                  <span><AlertCircle size={15} /> Спешност</span>
                  <strong>{statusLabel(booking.case?.urgency || 'normal')}</strong>
                </div>
                <div>
                  <span><CalendarDays size={15} /> Желана дата</span>
                  <strong>{bookingDate ? formatDate(bookingDate, false) : 'Не е посочена'}</strong>
                </div>
                <div>
                  <span><Clock3 size={15} /> Час / контакт</span>
                  <strong>{bookingTime || booking.preferred?.contactMethod || 'Не е посочено'}</strong>
                </div>
              </div>

              <div className="dAdminBookingSummary">
                <span>Описание от клиента</span>
                <p>{booking.case?.summary || 'Клиентът не е добавил описание на казуса.'}</p>
              </div>
            </div>
          </section>

          <section className="dAdminPanel">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><MessageSquareText size={18} /></span>
                <div>
                  <small>Вътрешна работа</small>
                  <h3>Бележки по заявката</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminBookingNotes">
              {booking.notes?.length > 0 ? (
                <div className="dAdminBookingNotes__timeline">
                  {booking.notes.map((note, index) => (
                    <article key={`${booking.id}-note-${note.id || index}`}>
                      <span><CircleDot size={14} /></span>
                      <div>
                        <small>{formatDate(note.createdAt)}</small>
                        <p>{note.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={MessageSquareText}
                  title="Все още няма вътрешни бележки"
                  text="Добавете първата бележка за следващо действие или важен детайл."
                  compact
                />
              )}

              <div className="dAdminBookingNotes__composer">
                <textarea
                  value={noteValue}
                  onChange={(event) => setBookingNotes((current) => ({
                    ...current,
                    [booking.id]: event.target.value,
                  }))}
                  placeholder="Напишете вътрешна бележка…"
                  rows={4}
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={saving || !noteValue.trim()}
                >
                  <MessageSquareText size={16} />
                  Добави бележка
                </button>
              </div>
            </div>
          </section>
        </main>

        <aside className="dAdminBookingDetailSide">
          <section className="dAdminPanel dAdminBookingClientCard">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><UserRound size={18} /></span>
                <div>
                  <small>Клиент</small>
                  <h3>Контактна информация</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body">
              <div className="dAdminBookingClientCard__identity">
                <span><UserRound size={22} /></span>
                <div>
                  <strong>{getClientName(booking)}</strong>
                  <small>{booking.source || 'website'}</small>
                </div>
              </div>

              <dl className="dAdminBookingClientCard__details">
                <div>
                  <dt>Телефон</dt>
                  <dd>{booking.client?.phone || 'Не е посочен'}</dd>
                </div>
                <div>
                  <dt>Имейл</dt>
                  <dd>{booking.client?.email || 'Не е посочен'}</dd>
                </div>
                <div>
                  <dt>Предпочитан контакт</dt>
                  <dd>{booking.preferred?.contactMethod || 'Не е посочен'}</dd>
                </div>
              </dl>

              <div className="dAdminBookingClientCard__actions">
                <BookingContactAction
                  href={`tel:${booking.client?.phone || ''}`}
                  icon={Phone}
                  label="Обади се"
                  disabled={!booking.client?.phone}
                />
                <BookingContactAction
                  href={`mailto:${booking.client?.email || ''}`}
                  icon={Mail}
                  label="Изпрати имейл"
                  disabled={!booking.client?.email}
                />
              </div>
            </div>
          </section>

          <section className="dAdminPanel dAdminBookingStatusCard">
            <header className="dAdminPanel__head">
              <div>
                <span className="dAdminPanel__icon"><CalendarCheck2 size={18} /></span>
                <div>
                  <small>Работен процес</small>
                  <h3>Бърза промяна</h3>
                </div>
              </div>
            </header>

            <div className="dAdminPanel__body dAdminBookingStatusCard__steps">
              {STATUS_OPTIONS.map((item) => (
                <button
                  className={booking.status === item.value ? 'is-active' : ''}
                  key={item.value}
                  type="button"
                  onClick={() => updateBookingStatus(booking.id, item.value)}
                  disabled={saving}
                >
                  <span><CheckCircle2 size={15} /></span>
                  <strong>{item.label}</strong>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default function BookingsView({ route, navigate, goBack, controller }) {
  const { bookings } = controller;
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === route.itemId) || null,
    [bookings, route.itemId]
  );

  useEffect(() => {
    if (!selectedBooking) return;
    const date = startOfDay(getBookingDate(selectedBooking));
    if (!date) return;
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [selectedBooking]);

  function openBooking(bookingId) {
    navigate({ section: 'bookings', itemId: bookingId, settingsPanel: '' });
  }

  if (route.itemId) {
    if (!selectedBooking) {
      return (
        <div className="dAdminView">
          <BackLink onClick={goBack}>Назад към календара</BackLink>
          <EmptyState
            icon={CalendarDays}
            title="Заявката не беше намерена"
            text="Възможно е да е премахната или данните все още да не са обновени."
          />
        </div>
      );
    }

    return (
      <BookingDetail
        booking={selectedBooking}
        goBack={goBack}
        controller={controller}
      />
    );
  }

  return (
    <div className="dAdminView dAdminBookingsView">
      <BookingCalendar
        bookings={bookings}
        month={month}
        onMonthChange={setMonth}
        selectedDay={selectedDay}
        onDaySelect={(day) => {
          setSelectedDay((current) => (
            dateKey(current) === dateKey(day) ? null : day
          ));
        }}
        onOpen={openBooking}
      />

      <BookingManagement
        bookings={bookings}
        selectedDay={selectedDay}
        onClearDay={() => setSelectedDay(null)}
        onOpen={openBooking}
        controller={controller}
      />
    </div>
  );
}
