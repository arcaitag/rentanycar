"use client";
import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Car, House, Person, Tree } from "./parts";

const EASE = [0.22, 0.8, 0.26, 1] as const;

/** Schlanker Baum (Pappel) wie am Seeufer */
function Poplar({ x, y, h, w, color }: { x: number; y: number; h: number; w: number; color: string }) {
  return (
    <g>
      <rect x={x - 1.8} y={y - 12} width="3.6" height="12" rx="1.8" fill="#2E6B4E" />
      <path d={`M${x} ${y - h}C${x + w} ${y - h * 0.64} ${x + w * 0.92} ${y - h * 0.14} ${x} ${y - 8}C${x - w * 0.92} ${y - h * 0.14} ${x - w} ${y - h * 0.64} ${x} ${y - h}Z`} fill={color} />
    </g>
  );
}

/**
 * Hero-Szene: An einem Schweizer See fährt ein Auto vor, die vermietende Person übergibt der mietenden den Schlüssel,
 * eine Standortmarkierung zeigt den Abholort. Auf dem Handy ein eigener, näherer Bildausschnitt, der unten weich
 * ausläuft; auf dem Desktop breiter, links in die Textspalte und rechts sowie unten weich auslaufend.
 */
export default function HeroIllustration() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sunY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const cloudX = useTransform(scrollYProgress, [0, 1], [0, -46]);
  const birdsX = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const boatX = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const still = !!reduce;

  return (
    <div
      ref={ref}
      className="relative h-[14.5rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_78%,transparent)] sm:h-[19rem] lg:-ml-[6%] lg:h-auto lg:w-[122%] lg:[mask-composite:intersect] lg:[mask-image:linear-gradient(to_right,transparent,#000_16%,#000_86%,transparent),linear-gradient(to_bottom,#000_86%,transparent)]"
    >
      <svg
        viewBox="0 40 800 460"
        className="absolute bottom-0 left-1/2 w-[156%] max-w-none -translate-x-[49%] sm:w-[115%] lg:static lg:w-full lg:translate-x-0"
        role="img"
        aria-labelledby="hero-art"
      >
        <title id="hero-art">Illustration: An einem See in den Schweizer Bergen steht ein grünes Mietauto. Eine Person übergibt einer anderen den Autoschlüssel, daneben markiert eine Standortnadel den Abholort.</title>

        <m.circle cx="662" cy="96" r="36" fill="#F6E3A6" style={{ y: still ? 0 : sunY }} />
        <m.g style={{ x: still ? 0 : cloudX }} fill="#FFFFFF">
          <path d="M450 128c0-12 10-20 22-20 8 0 14 4 18 10 3-2 6-3 10-3 10 0 17 7 17 16v1H450Z" />
          <path d="M700 172c0-9 7-15 16-15 6 0 10 3 13 7 2-1 5-2 7-2 7 0 12 5 12 12v1H700Z" />
        </m.g>
        <m.g style={{ x: still ? 0 : birdsX }} stroke="#66736D" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M548 112l7 6 7-6" />
          <path d="M572 98l6 5 6-5" />
        </m.g>

        {/* Berge in zwei Ebenen */}
        <path d="M-20 312L60 262L120 286L196 222L252 256L360 150L440 226L506 190L596 250L690 178L820 256V340H-20Z" fill="#E1F2EA" />
        <path d="M360 150L382 176L370 173L360 184L350 173L338 176ZM690 178L708 198L698 196L690 205L682 196L672 198ZM196 222L212 236L204 235L196 242L189 235L181 236Z" fill="#FFFFFF" />
        <path d="M-20 330L40 300L140 274L214 306L318 248L408 306L500 264L604 318L706 272L820 306V358H-20Z" fill="#CFE9DA" />

        {/* Dorf mit Kirche am anderen Ufer */}
        <path d="M-20 352C120 344 300 346 430 342C560 338 680 344 820 340V362H-20Z" fill="#BDE2CC" />
        <House x={262} y={348} w={18} h={13} roof="#38A96B" />
        <House x={286} y={347} w={22} h={15} roof="#79D99F" />
        <rect x="316" y="312" width="9" height="35" fill="#FFFFFF" />
        <path d="M314 313L320.5 292L327 313Z" fill="#38A96B" />
        <House x={334} y={348} w={20} h={14} roof="#38A96B" />
        <House x={360} y={347} w={16} h={12} roof="#79D99F" />
        <Tree x={390} y={350} r={9} color="#38A96B" />

        {/* See mit Segelboot */}
        <path d="M-20 358H820V396H-20Z" fill="#D3EEEC" />
        <path d="M60 370h40M520 366h40M600 384h24M140 386h26" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity=".85" />
        <m.g style={{ x: still ? 0 : boatX }}>
          <path d="M654 380h36l-6 7h-24Z" fill="#2E6B4E" />
          <path d="M673 380V346" stroke="#2E6B4E" strokeWidth="1.6" />
          <path d="M674.5 348V377H691Z" fill="#FFFFFF" />
          <path d="M671.5 353V377H659Z" fill="#FFFFFF" opacity=".9" />
        </m.g>

        {/* Ufer mit Pappeln */}
        <path d="M-20 392C150 384 300 388 440 386C580 384 690 388 820 384V436H-20Z" fill="#C6E8D3" />
        <Poplar x={70} y={398} h={58} w={12} color="#2E8B57" />
        <Poplar x={94} y={396} h={96} w={16} color="#38A96B" />
        <Poplar x={120} y={398} h={72} w={13} color="#79D99F" />
        <Poplar x={714} y={392} h={70} w={13} color="#79D99F" />
        <Poplar x={740} y={392} h={108} w={18} color="#38A96B" />
        <Poplar x={770} y={394} h={82} w={14} color="#79D99F" />
        <Poplar x={798} y={392} h={96} w={16} color="#2E8B57" />

        {/* Strasse */}
        <path d="M-20 423C180 412 380 408 560 412C660 414 740 418 820 423V457C740 450 660 446 560 444C380 440 180 444 -20 455Z" fill="#FFFFFF" />
        <path d="M0 438C200 428 380 425 560 428C650 430 730 434 800 439" stroke="#D5EDE0" strokeWidth="3" strokeDasharray="16 13" fill="none" />
        <path d="M-20 453C180 442 380 438 560 442C660 444 740 448 820 453V500H-20Z" fill="#DAF2E2" />

        {/* Auto fährt vor und parkt */}
        <m.g initial={still ? false : { x: -280, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.95, ease: EASE }}>
          <Car name="gruen" x={166} ground={438} w={232} />
        </m.g>

        {/* Schlüsselübergabe */}
        <m.g initial={still ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5, ease: EASE }}>
          <Person x={442} y={442} s={0.86} flip long hold="reach" jacket="#D9A441" pants="#2F5D78" skin="#E0B08C" hair="#5A3B26" />
          <Person x={528} y={442} s={0.86} hold="reach" jacket="#174B38" pants="#3F6E8C" skin="#C98B67" hair="#2B211B" />
        </m.g>
        <m.g initial={still ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0, duration: 0.6, ease: EASE }}>
          <circle cx="485" cy="369" r="4.6" fill="#F6E3A6" stroke="#174B38" strokeWidth="1.5" />
          <circle cx="485" cy="369" r="1.4" fill="#174B38" />
          <path d="M485 373.6V385M485 380h3M485 383.5h2.6" stroke="#174B38" strokeWidth="2" strokeLinecap="round" fill="none" />
        </m.g>

        {/* Bestätigung wie in der App */}
        <m.g
          initial={still ? false : { opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.35, duration: 0.45, ease: EASE }}
          style={{ transformBox: "fill-box", transformOrigin: "20% 100%" }}
        >
          <rect x="436" y="291" width="104" height="34" rx="12" fill="#174B38" opacity=".08" />
          <rect x="436" y="288" width="104" height="34" rx="12" fill="#FFFFFF" />
          <path d="M456 321l-4 9 12-9Z" fill="#FFFFFF" />
          <circle cx="454" cy="305" r="9" fill="#38A96B" />
          <path d="M449.8 305.2l2.9 2.9 5.6-5.8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="469" y="298" width="56" height="5" rx="2.5" fill="#CFE3D8" />
          <rect x="469" y="308" width="38" height="5" rx="2.5" fill="#E3EFE8" />
        </m.g>

        {/* Abholort */}
        <m.circle
          cx="596" cy="446" r="18" fill="none" stroke="#38A96B" strokeWidth="2.5"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={still ? false : { scale: 0.4, opacity: 0 }}
          animate={still ? { opacity: 0 } : { scale: [0.4, 1.9], opacity: [0.8, 0] }}
          transition={{ delay: 0.95, duration: 0.8, ease: "easeOut" }}
        />
        <m.g initial={still ? false : { y: -46, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, type: "spring", stiffness: 260, damping: 18 }}>
          <g transform="translate(596 446) scale(0.9)">
            <ellipse cy="1" rx="12" ry="3.5" fill="#174B38" opacity=".18" />
            <path d="M0 0C-4 -9 -22 -22 -22 -39A22 22 0 1 1 22 -39C22 -22 4 -9 0 0Z" fill="#174B38" />
            <circle cy="-39" r="8.5" fill="#79D99F" />
          </g>
        </m.g>

        {/* Büsche im Vordergrund */}
        <g fill="#79D99F">
          <circle cx="36" cy="478" r="28" />
          <circle cx="742" cy="476" r="26" />
        </g>
        <g fill="#38A96B">
          <circle cx="74" cy="488" r="22" />
          <circle cx="8" cy="490" r="20" />
          <circle cx="776" cy="484" r="30" />
          <circle cx="708" cy="492" r="18" />
        </g>
      </svg>
    </div>
  );
}
