import { Button } from "@heroui/react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { PiHandsClappingLight, PiHandsClappingFill } from "react-icons/pi"
import NumberFlow from "@number-flow/react"

export interface ClapClusterProps {
  displayClaps: number;
  isClapped: boolean;
  isHovering: boolean;
  canPrompt: boolean;
  phase: 'idle' | 'thanking';
  floatingClaps: { id: number }[];
  onClap: () => void;
  onEnter: () => void;
  onLeave: () => void;
}

export function ClapCluster({
  displayClaps,
  isClapped,
  isHovering,
  canPrompt,
  phase,
  floatingClaps,
  onClap,
  onEnter,
  onLeave
}: ClapClusterProps) {
  const t = useTranslations('Moment')

  return (
    <div className="flex -mx-1.5 mt-2 items-center gap-1">
      <div className="relative">
        <motion.div layout whileTap={{ scale: 0.85 }} className={isClapped ? "rounded-full bg-foreground/5" : ""}>
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={onClap}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            aria-label={t('clap-prompt')}
          >
            {isClapped
              ? <PiHandsClappingFill size={18} className={isClapped || isHovering ? "text-accent transition-colors duration-200" : "text-foreground/60"} />
              : <PiHandsClappingLight size={18} className={isClapped || isHovering ? "text-accent transition-colors duration-200" : "text-foreground/60"} />
            }
          </Button>
        </motion.div>
        <AnimatePresence>
          {floatingClaps.map(({ id }) => (
            <motion.div
              key={id}
              initial={{ y: 0, opacity: 1, scale: 1, rotate: 0, x: "-50%" }}
              animate={{ y: -56, opacity: 0, scale: 0.4, rotate: Math.random() * 90 - 45, x: `${Math.random() * 100 - 50}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-1/2 top-0 pointer-events-none text-accent"
            >
              <PiHandsClappingFill size={14} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout">
        {phase === 'thanking' && (
          <motion.span
            key="thanks"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="whitespace-nowrap text-sm text-accent/60"
          >
            {t('clap-thanks')}
          </motion.span>
        )}
        {phase !== 'thanking' && isHovering && canPrompt && (
          <motion.span
            key="prompt"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="whitespace-nowrap text-sm text-accent/60"
          >
            {t('clap-prompt')}
          </motion.span>
        )}
        {phase !== 'thanking' && displayClaps > 0 && !(isHovering && canPrompt) && (
          <motion.span
            key="count"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className={`whitespace-nowrap font-code text-sm inline-flex items-center cursor-pointer pointer-events-none ${isClapped || isHovering ? "text-accent" : "text-foreground/60"}`}
          >
            <NumberFlow value={displayClaps} />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
