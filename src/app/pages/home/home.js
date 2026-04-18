import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { filterPools } from "../../slices/pool";
import { Hourglass } from "react-loader-spinner";
import Pool from "../../components/pool/pool";
import {
  LuPlus,
  LuCompass,
  LuShieldCheck,
  LuCircleCheckBig,  // ✅ Correct name (note the "2")
  LuLock,
} from "react-icons/lu";
import styles from "./home.module.css";

const STATS = [
  { value: "1,284", label: "Active Pools" },
  { value: "$2.4M", label: "Total Raised" },
  { value: "45k+", label: "Community Members" },
  { value: "94%", label: "Success Rate" },
];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();



  return (
    <div className={styles.homePage}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Raise Together.</h1>
          <p className={styles.heroSubtitle}>
            The modern platform for group funding, community pools, and making
            dreams a collective reality.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/pool-create" className={styles.heroBtnPrimary}>
              <LuPlus size={18} strokeWidth={3} />
              Start a Pool
            </Link>
            <Link to="/pools" className={styles.heroBtnSecondary}>
              Explore Pools
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.inner}>
        {/* ── Stats Bar ── */}
        <div className={styles.statsBar}>
          {STATS.map((s, i) => (
            <div key={i}>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Featured Pools ── */}
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Topics</h2>
              <p className={styles.sectionSubtitle}>
                Discover causes that matter to our community right now.
              </p>
            </div>
            <Link to="/pools" className={styles.exploreBtn}>
              <LuCompass size={14} />
              Explore all
            </Link>
          </div>

        </section>

        {/* ── Trust Section ── */}
        <section className={styles.trustSection}>
          <div className={styles.trustLeft}>
            <div className={styles.trustTag}>
              <LuShieldCheck size={13} />
              Safe &amp; Trusted
            </div>
            <h2 className={styles.trustTitle}>Your trust is our priority.</h2>
            <p className={styles.trustDesc}>
              We use military-grade security and a community-driven verification
              system to ensure every dollar goes exactly where it's supposed to.
            </p>
            <div className={styles.trustFeatures}>
              <div className={styles.trustFeature}>
                <div className={styles.trustFeatureIcon}>
                  <LuCircleCheckBig size={22} />
                </div>
                <span className={styles.trustFeatureLabel}>
                  Verified Identity
                </span>
              </div>
              <div className={styles.trustFeature}>
                <div className={styles.trustFeatureIcon}>
                  <LuPlus size={22} />
                </div>
                <span className={styles.trustFeatureLabel}>24/7 Support</span>
              </div>
            </div>
          </div>

          <div className={styles.trustRight}>
            <div className={styles.trustCard}>
              <div>
                <div className={styles.trustCardIcon}>
                  <LuLock size={30} />
                </div>
                <h3 className={styles.trustCardTitle} style={{ marginTop: 20 }}>
                  Transparent Payouts
                </h3>
                <p className={styles.trustCardDesc} style={{ marginTop: 12 }}>
                  Voting-based payout system ensures absolute transparency for
                  all group members.
                </p>
              </div>
              <button
                className={styles.trustCardBtn}
                onClick={() => navigate("/support")}
              >
                Learn more
              </button>
            </div>
          </div>
        </section>

        {/* ── CTA Newsletter Banner ── */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaBannerGlow1} />
          <div className={styles.ctaBannerGlow2} />
          <h2 className={styles.ctaTitle}>Sign up for our impact stories</h2>
          <p className={styles.ctaSubtitle}>
            Get weekly updates on how contributions are making a difference
            around the world.
          </p>
          <div className={styles.ctaForm}>
            <input
              type="email"
              placeholder="Email address"
              className={styles.ctaInput}
            />
            <button className={styles.ctaSubmit}>Subscribe</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
