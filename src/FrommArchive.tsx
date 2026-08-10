"use client";

import { useEffect, useMemo, useState } from "react";

type Media = { id: string; kind: "image" | "audio" | "video" | "other"; mimeType: string; date: number; year?: number; month?: number };
type Gallery = { id: string; name: string; date: number; year: number; members: string[]; media: Media[] };
type Member = { id: string; name: string; media: Media[] };
export type Archive = { generatedAt: string; sourceFolderId: string; groupGalleries: Gallery[]; members: Member[] };

const groupMembers = ["Sangyeon", "Jacob", "Younghoon", "Hyunjae", "Juyeon", "Kevin", "Q", "Sunwoo", "Eric"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pageSize = 24;

const thumbnail = (id: string, size = "w1200") => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=${size}`;
const folderUrl = (id: string) => `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`;
const fileUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
const previewUrl = (id: string) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
const directUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
const formatDate = (date: number) => {
  const value = String(date).padStart(8, "0");
  return date ? `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}` : "—";
};

function MediaTile({ media, group = false }: { media: Media; group?: boolean }) {
  if (media.kind === "audio") {
    return (
      <figure className="media-tile audio-tile">
        <div className="audio-mark" aria-hidden="true">AUDIO / FROMM</div>
        <iframe src={previewUrl(media.id)} title="Fromm audio message" allow="autoplay" loading="lazy" />
        <a className="media-link" href={fileUrl(media.id)} target="_blank" rel="noreferrer">OPEN IN DRIVE ↗</a>
      </figure>
    );
  }
  if (media.kind === "video") {
    return (
      <figure className="media-tile video-tile">
        <iframe src={previewUrl(media.id)} title="Fromm video" allow="autoplay; fullscreen" loading="lazy" />
        <a className="media-link" href={fileUrl(media.id)} target="_blank" rel="noreferrer">OPEN VIDEO ↗</a>
      </figure>
    );
  }
  return (
    <figure className="media-tile">
      <a href={fileUrl(media.id)} target="_blank" rel="noreferrer" aria-label="Open original image in Google Drive">
        <img src={thumbnail(media.id, group ? "w1600" : "w1200")} alt="" loading="lazy" />
      </a>
      <div className="image-actions"><a href={fileUrl(media.id)} target="_blank" rel="noreferrer">VIEW ↗</a><a href={directUrl(media.id)} target="_blank" rel="noreferrer">DOWNLOAD ↓</a></div>
    </figure>
  );
}

export function FrommArchive({ data }: { data: Archive }) {
  const now = new Date();
  const [source, setSource] = useState<"group" | "members">("group");
  const [query, setQuery] = useState("");
  const [groupMember, setGroupMember] = useState("all");
  const [groupYear, setGroupYear] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [shown, setShown] = useState(pageSize);
  const [openGallery, setOpenGallery] = useState<Gallery | null>(null);
  const [galleryShown, setGalleryShown] = useState(pageSize);
  const [member, setMember] = useState<Member | null>(null);
  const [memberYear, setMemberYear] = useState(now.getFullYear());
  const [memberMonth, setMemberMonth] = useState(now.getMonth() + 1);
  const [memberShown, setMemberShown] = useState(pageSize);

  const years = useMemo(() => [...new Set(data.groupGalleries.map((gallery) => gallery.year))].sort((a, b) => b - a), [data]);
  const galleries = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    return data.groupGalleries
      .filter((gallery) => groupYear === "all" || gallery.year === Number(groupYear))
      .filter((gallery) => groupMember === "all" || gallery.members.includes(groupMember))
      .filter((gallery) => !value || gallery.name.toLocaleLowerCase().includes(value))
      .sort((a, b) => sort === "newest" ? b.date - a.date : a.date - b.date);
  }, [data, groupMember, groupYear, query, sort]);

  const memberYears = useMemo(() => member ? [...new Set(member.media.map((item) => item.year).filter(Boolean) as number[])].sort((a, b) => b - a) : [], [member]);
  const memberMonths = useMemo(() => member ? [...new Set(member.media.filter((item) => item.year === memberYear).map((item) => item.month).filter(Boolean) as number[])].sort((a, b) => b - a) : [], [member, memberYear]);
  const memberMedia = useMemo(() => member ? member.media.filter((item) => item.year === memberYear && item.month === memberMonth).sort((a, b) => b.date - a.date) : [], [member, memberMonth, memberYear]);
  const visibleMembers = useMemo(() => data.members.filter((item) => item.name.toLocaleLowerCase() !== "new"), [data]);
  const totalMedia = data.groupGalleries.reduce((sum, gallery) => sum + gallery.media.length, 0) + visibleMembers.reduce((sum, item) => sum + item.media.length, 0);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(openGallery));
    return () => document.body.classList.remove("modal-open");
  }, [openGallery]);

  const changeSource = (next: "group" | "members") => {
    setSource(next);
    setMember(null);
    setShown(pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseMember = (next: Member) => {
    const currentYear = next.media.some((item) => item.year === now.getFullYear()) ? now.getFullYear() : Math.max(...next.media.map((item) => item.year || 0));
    setMember(next);
    setMemberYear(currentYear);
    setMemberMonth(now.getMonth() + 1);
    setMemberShown(pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main id="top">
      <header className="masthead">
        <div className="utility"><a className="brand" href="https://tbzarchive1206.github.io/tbzarchive/">THE BOYZ / FAN ARCHIVE</a><nav><span>FROMM MEDIA</span><span>/</span><a href="https://x.com/tbzarchive1206_" target="_blank" rel="noreferrer">TWITTER ↗</a></nav></div>
        <h1><span className="solid">FROMM MEDIA</span><span className="outline">ARCHIVE</span></h1>
        <div className="stats"><p><strong>{data.groupGalleries.length}</strong> GALLERIES</p><i /><p><strong>{totalMedia.toLocaleString("en-US")}</strong> MEDIA FILES</p><i /><p>UPDATED <strong>{new Date(data.generatedAt).toLocaleDateString("en-GB")}</strong></p></div>
      </header>

      <section className="source-switch" aria-label="Media source">
        <button className={source === "group" ? "active" : ""} onClick={() => changeSource("group")}><span>01</span> GROUP MEDIA CONTENT</button>
        <button className={source === "members" ? "active" : ""} onClick={() => changeSource("members")}><span>02</span> MEMBERS MEDIA</button>
      </section>

      {source === "group" ? (
        <>
          <section className="controls" aria-label="Group gallery controls">
            <label className="search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setShown(pageSize); }} type="search" placeholder="SEARCH GALLERIES..." /></label>
            <div className="filter-row three">
              <label>MEMBER<select value={groupMember} onChange={(event) => { setGroupMember(event.target.value); setShown(pageSize); }}><option value="all">ALL MEMBERS</option>{groupMembers.map((name) => <option key={name}>{name}</option>)}</select></label>
              <label>YEAR<select value={groupYear} onChange={(event) => { setGroupYear(event.target.value); setShown(pageSize); }}><option value="all">ALL YEARS</option>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
              <label>SORT<select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">NEWEST FIRST</option><option value="oldest">OLDEST FIRST</option></select></label>
            </div>
            <div className="member-tabs"><button className={groupMember === "all" ? "selected" : ""} onClick={() => setGroupMember("all")}>ALL MEMBERS</button>{groupMembers.map((name) => <button className={groupMember === name ? "selected" : ""} onClick={() => { setGroupMember(name); setShown(pageSize); }} key={name}>{name.toUpperCase()}</button>)}</div>
          </section>
          <section className="archive-section">
            <div className="results-head"><p>{groupMember === "all" ? "ALL GALLERIES" : groupMember.toUpperCase()} · {galleries.length}</p><a href={folderUrl("1kqUQd9cu-6REfewSxC8Anu1fCsHkkTVs")} target="_blank" rel="noreferrer">OPEN SOURCE FOLDER ↗</a></div>
            <div className="cards">
              {galleries.slice(0, shown).map((gallery, index) => {
                const cover = gallery.media.find((item) => item.kind === "image");
                return <article className="card" key={gallery.id}>
                  <button className="thumb" onClick={() => { setOpenGallery(gallery); setGalleryShown(pageSize); }} aria-label={`View gallery ${gallery.name}`}>
                    {cover ? <img src={thumbnail(cover.id)} alt="" loading="lazy" /> : <span className="no-cover">FROMM / MEDIA</span>}
                    <span className="number">{String(index + 1).padStart(3, "0")}</span><span className="photo-count">{gallery.media.length} MEDIA</span>
                  </button>
                  <div className="card-info"><div className="eyebrow">GROUP MEDIA CONTENT / {gallery.year}</div><h2>{gallery.name}</h2><div className="meta"><span>GALLERY</span><b>{gallery.media.length} FILES</b><span>DATE</span><b>{formatDate(gallery.date)}</b></div><div className="card-actions"><button onClick={() => { setOpenGallery(gallery); setGalleryShown(pageSize); }}>VIEW GALLERY →</button><a href={folderUrl(gallery.id)} target="_blank" rel="noreferrer">DRIVE ↗</a></div></div>
                </article>;
              })}
            </div>
            {!galleries.length && <div className="empty"><strong>NO RESULTS</strong>TRY CHANGING THE SEARCH OR FILTERS.</div>}
            {shown < galleries.length && <button className="load-more" onClick={() => setShown((value) => value + pageSize)}>LOAD MORE ↓</button>}
          </section>
        </>
      ) : !member ? (
        <section className="member-picker">
          <div className="picker-head"><p>SELECT A MEMBER</p><a href={folderUrl("196Xa4Nmb6hbBsIWl2jDuldH7FTmbWnzc")} target="_blank" rel="noreferrer">OPEN SOURCE FOLDER ↗</a></div>
          <div className="member-grid">{visibleMembers.map((item, index) => <button key={item.id} onClick={() => chooseMember(item)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name.toUpperCase()}</strong><small>{item.media.length.toLocaleString("en-US")} MEDIA FILES →</small></button>)}</div>
        </section>
      ) : (
        <section className="member-gallery">
          <header className="member-gallery-head"><button onClick={() => setMember(null)}>← ALL MEMBERS</button><div><span>MEMBERS MEDIA</span><h2>{member.name.toUpperCase()}</h2></div><a href={folderUrl(member.id)} target="_blank" rel="noreferrer">OPEN FOLDER ↗</a></header>
          <div className="member-filters"><label>YEAR<select value={memberYear} onChange={(event) => { setMemberYear(Number(event.target.value)); setMemberShown(pageSize); }} aria-label="Filter member media by year">{memberYears.map((year) => <option key={year}>{year}</option>)}</select></label><label>MONTH<select value={memberMonth} onChange={(event) => { setMemberMonth(Number(event.target.value)); setMemberShown(pageSize); }} aria-label="Filter member media by month">{monthNames.map((name, index) => <option value={index + 1} key={name}>{String(index + 1).padStart(2, "0")} / {name.toUpperCase()}</option>)}</select></label><p>{memberMonths.includes(memberMonth) ? `${memberMedia.length} MEDIA FILES` : "NO UPLOADS"}</p></div>
          <div className="member-period"><p>{monthNames[memberMonth - 1]} / {memberYear}</p><span>NEWEST MEDIA FIRST</span></div>
          {memberMedia.length ? <div className="media-grid">{memberMedia.slice(0, memberShown).map((item) => <MediaTile key={item.id} media={item} />)}</div> : <div className="empty member-empty"><strong>NO MEDIA</strong>THERE ARE NO UPLOADS FOR THIS MONTH.</div>}
          {memberShown < memberMedia.length && <button className="load-more" onClick={() => setMemberShown((value) => value + pageSize)}>LOAD MORE MEDIA ↓</button>}
        </section>
      )}

      <footer><a href="https://tbzarchive1206.github.io/tbzarchive/">← MAIN ARCHIVE</a><a href="#top">BACK TO TOP ↑</a></footer>

      {openGallery && <div className="gallery-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-title">
        <div className="gallery-shell"><header className="gallery-head"><div><div className="gallery-kicker">GROUP MEDIA CONTENT · {openGallery.media.length} FILES</div><h2 id="gallery-title">{openGallery.name}</h2></div><div className="gallery-actions"><a href={folderUrl(openGallery.id)} target="_blank" rel="noreferrer">OPEN FOLDER ↗</a><button onClick={() => setOpenGallery(null)} aria-label="Close gallery">×</button></div></header><p className="gallery-note">SELECT AN IMAGE TO OPEN THE ORIGINAL FILE. USE “DOWNLOAD ↓” TO SAVE IT.</p><div className="photo-grid">{openGallery.media.slice(0, galleryShown).map((item) => <MediaTile key={item.id} media={item} group />)}</div>{galleryShown < openGallery.media.length && <button className="load-more gallery-more" onClick={() => setGalleryShown((value) => value + pageSize)}>LOAD MORE MEDIA ↓</button>}</div>
      </div>}
    </main>
  );
}
