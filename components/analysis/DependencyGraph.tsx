import React, { useMemo, useRef, useState } from "react";
import { View, ScrollView, LayoutChangeEvent } from "react-native";
import Svg, { Path, Text as SvgText, Defs, Marker, Polygon } from "react-native-svg";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";
import type { TokenNode, RuleBasedError } from "@/lib/api";
import { WordCard } from "./WordCard";

const CARD_WIDTH = 100;
const CARD_GAP = 12;
const ARC_AREA_HEIGHT = 100;

interface DependencyGraphProps {
  nodes: TokenNode[];
  grammarErrors?: RuleBasedError[];
  selectedTokenId: number | null;
  onSelectToken: (id: number | null) => void;
}

export function DependencyGraph({
  nodes,
  grammarErrors,
  selectedTokenId,
  onSelectToken,
}: DependencyGraphProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const filteredNodes = useMemo(
    () => nodes.filter((n) => n.upos !== "PUNCT"),
    [nodes]
  );

  const errorMap = useMemo(() => {
    const map = new Map<number, RuleBasedError>();
    grammarErrors?.forEach((e) => map.set(e.word_id, e));
    return map;
  }, [grammarErrors]);

  const totalWidth = filteredNodes.length * (CARD_WIDTH + CARD_GAP) + 16;

  const getX = (nodeId: number) => {
    const idx = filteredNodes.findIndex((n) => n.id === nodeId);
    if (idx === -1) return 0;
    return 16 + idx * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;
  };

  const arcs = useMemo(() => {
    return filteredNodes
      .filter((n) => n.head_id !== 0)
      .map((node) => {
        const fromX = getX(node.head_id);
        const toX = getX(node.id);
        const distance = Math.abs(fromX - toX);
        const height = Math.min(ARC_AREA_HEIGHT - 10, 20 + distance * 0.15);
        const midX = (fromX + toX) / 2;
        const controlY = ARC_AREA_HEIGHT - height;

        return {
          id: node.id,
          fromX,
          toX,
          midX,
          controlY,
          deprel: node.deprel,
          path: `M ${fromX} ${ARC_AREA_HEIGHT} Q ${midX} ${controlY} ${toX} ${ARC_AREA_HEIGHT}`,
        };
      });
  }, [filteredNodes]);

  const handleUposPress = (upos: string) => {
    router.push({
      pathname: "/grammar-reference",
      params: { type: "upos", key: upos },
    });
  };

  return (
    <View style={{ marginTop: 8 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        <View style={{ width: totalWidth }}>
          {/* SVG Arc Layer */}
          <Svg
            width={totalWidth}
            height={ARC_AREA_HEIGHT}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <Defs>
              <Marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="4"
                refX="6"
                refY="2"
                orient="auto"
              >
                <Polygon
                  points="0,0 6,2 0,4"
                  fill={colors.primary}
                  opacity={0.6}
                />
              </Marker>
            </Defs>
            {arcs.map((arc) => (
              <React.Fragment key={arc.id}>
                <Path
                  d={arc.path}
                  stroke={colors.primary}
                  strokeWidth={1.5}
                  fill="none"
                  opacity={0.5}
                  markerEnd="url(#arrowhead)"
                />
                <SvgText
                  x={arc.midX}
                  y={arc.controlY - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="JetBrainsMono"
                  fill={colors.mutedForeground}
                >
                  {arc.deprel}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>

          {/* Word Cards */}
          <View
            style={{
              flexDirection: "row",
              gap: CARD_GAP,
              paddingTop: ARC_AREA_HEIGHT,
              paddingHorizontal: 8,
            }}
          >
            {filteredNodes.map((node) => (
              <WordCard
                key={node.id}
                token={node}
                isSelected={selectedTokenId === node.id}
                onPress={() =>
                  onSelectToken(
                    selectedTokenId === node.id ? null : node.id
                  )
                }
                error={errorMap.get(node.id)}
                onUposPress={() => handleUposPress(node.upos)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
